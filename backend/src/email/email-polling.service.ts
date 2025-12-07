import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ProposalStatus, EmailDirection } from '@prisma/client';

@Injectable()
export class EmailPollingService implements OnModuleInit {
  private readonly logger = new Logger(EmailPollingService.name);
  private imap: Imap | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  onModuleInit() {
    // Initialize IMAP connection if configured
    const imapEnabled = this.configService.get<boolean>('MAIL_IMAP_ENABLED', false);
    
    if (imapEnabled) {
      this.initializeImap();
      this.logger.log('Email polling service initialized');
    } else {
      this.logger.warn('Email polling disabled. Set MAIL_IMAP_ENABLED=true to enable automatic email checking.');
    }
  }

  private initializeImap() {
    try {
      this.imap = new Imap({
        user: this.configService.get<string>('MAIL_IMAP_USER') || this.configService.get<string>('MAIL_USER'),
        password: this.configService.get<string>('MAIL_IMAP_PASSWORD') || this.configService.get<string>('MAIL_PASSWORD'),
        host: this.configService.get<string>('MAIL_IMAP_HOST') || 'imap.hostinger.com',
        port: this.configService.get<number>('MAIL_IMAP_PORT', 993),
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false,
        },
      });

      this.imap.once('error', (err: Error) => {
        this.logger.error('IMAP connection error:', err);
      });

      this.logger.log('IMAP configuration loaded');
    } catch (error) {
      this.logger.error('Failed to initialize IMAP:', error.message);
    }
  }

  // Run every 10 minutes to check for new emails
  @Cron(CronExpression.EVERY_MINUTE)
  async checkForNewEmails() {
    if (!this.imap) {
      return;
    }

    this.logger.log('Checking for new vendor emails from the last hour...');

    try {
      await this.processInbox();
    } catch (error) {
      this.logger.error('Error checking emails:', error.message);
    }
  }

  private async processInbox(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, async (err: Error, box: any) => {
          if (err) {
            reject(err);
            return;
          }

          // Calculate date for 1 hour ago
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);
          const searchDate = oneHourAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

          // Search for unseen emails from the last hour
          this.imap.search(['UNSEEN', ['SINCE', searchDate]], async (err: Error, results: number[]) => {
            if (err) {
              reject(err);
              return;
            }

            if (!results || results.length === 0) {
              this.logger.log('No new emails found');
              this.imap.end();
              resolve();
              return;
            }

            this.logger.log(`Found ${results.length} new email(s)`);

            const fetch = this.imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg: any, seqno: number) => {
              msg.on('body', (stream: any) => {
                simpleParser(stream, async (err: Error, parsed: any) => {
                  if (err) {
                    this.logger.error('Error parsing email:', err);
                    return;
                  }

                  try {
                    const isRFPEmail = await this.processEmail(parsed);
                    
                    // Mark as read only if it's an RFP-related email
                    if (isRFPEmail) {
                      this.imap.addFlags(seqno, ['\\Seen'], (err: Error) => {
                        if (err) {
                          this.logger.error('Error marking email as read:', err);
                        } else {
                          this.logger.log(`Marked RFP email ${seqno} as read`);
                        }
                      });
                    }
                  } catch (error) {
                    this.logger.error('Error processing email:', error.message);
                  }
                });
              });
            });

            fetch.once('error', (err: Error) => {
              this.logger.error('Fetch error:', err);
              reject(err);
            });

            fetch.once('end', () => {
              this.logger.log('Email fetch completed');
              this.imap.end();
              resolve();
            });
          });
        });
      });

      this.imap.once('error', (err: Error) => {
        reject(err);
      });

      this.imap.connect();
    });
  }

  private async processEmail(parsed: any): Promise<boolean> {
    try {
      const from = parsed.from?.value?.[0]?.address || parsed.from?.text;
      const subject = parsed.subject || '';
      const body = parsed.text || parsed.html || '';

      if (!from || !body) {
        this.logger.warn('Email missing required fields (from/body), skipping');
        return false;
      }

      this.logger.log(`Processing email from: ${from}, subject: ${subject}`);

      // Check if this is a reply to an RFP
      const isRFPReply = subject.toLowerCase().includes('rfp') || subject.toLowerCase().includes('re:');
      
      if (!isRFPReply) {
        this.logger.log('Email is not an RFP reply, skipping');
        return false;
      }

      // Find vendor by email
      const vendor = await this.prisma.vendor.findUnique({
        where: { email: from },
      });

      if (!vendor) {
        this.logger.warn(`No vendor found with email: ${from}`);
        return false;
      }

      // Extract RFP ID from subject
      let rfpId: string | null = null;
      const rfpIdMatch = subject.match(/\[ID:\s*([a-zA-Z0-9-]+)\]/i);
      
      if (rfpIdMatch) {
        rfpId = rfpIdMatch[1];
      } else {
        // Find the latest RFP sent to this vendor
        const rfpVendor = await this.prisma.rFPVendor.findFirst({
          where: { vendorId: vendor.id, emailSent: true },
          orderBy: { sentAt: 'desc' },
        });
        
        if (rfpVendor) {
          rfpId = rfpVendor.rfpId;
        }
      }

      if (!rfpId) {
        this.logger.warn(`Could not determine RFP ID for email from ${from}`);
        return true; // Still mark as read since it's RFP-related
      }

      // Check if proposal already exists
      const existingProposal = await this.prisma.proposal.findUnique({
        where: {
          rfpId_vendorId: {
            rfpId,
            vendorId: vendor.id,
          },
        },
      });

      if (existingProposal) {
        this.logger.warn(`Proposal already exists for RFP ${rfpId} from vendor ${vendor.name}`);
        return true; // Mark as read since already processed
      }

      // Get RFP details
      const rfp = await this.prisma.rFP.findUnique({
        where: { id: rfpId },
      });

      if (!rfp) {
        this.logger.warn(`RFP ${rfpId} not found`);
        return true; // Mark as read to avoid reprocessing
      }

      // Log the email
      const emailLog = await this.prisma.emailLog.create({
        data: {
          fromEmail: from,
          toEmail: this.configService.get<string>('MAIL_USER'),
          subject,
          body,
          direction: EmailDirection.INBOUND,
          rfpId,
          processed: false,
        },
      });

      // Parse the email with AI
      this.logger.log(`Parsing proposal with AI for RFP ${rfpId}`);
      const parsedData = await this.aiService.parseProposal(body, rfp.requirements);

      // Create the proposal
      const proposal = await this.prisma.proposal.create({
        data: {
          rfpId,
          vendorId: vendor.id,
          rawContent: body,
          parsedData,
          pricing: parsedData.pricing || null,
          deliveryTime: parsedData.deliveryTime || null,
          warranty: parsedData.warranty || null,
          paymentTerms: parsedData.paymentTerms || null,
          status: ProposalStatus.PARSED,
        },
        include: {
          vendor: true,
          rfp: true,
        },
      });

      // Update email log as processed
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { 
          processed: true,
          proposalId: proposal.id,
        },
      });

      this.logger.log(`✅ Successfully created proposal ${proposal.id} from email`);
      return true; // Mark as read after successful processing
      
    } catch (error) {
      this.logger.error(`Error processing email: ${error.message}`, error.stack);
      return false; // Don't mark as read if processing failed
    }
  }

  // Manual trigger for testing
  async checkNow() {
    this.logger.log('Manually triggered email check');
    return this.checkForNewEmails();
  }
}
