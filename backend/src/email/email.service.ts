import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { EmailDirection } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const mailHost = this.configService.get<string>('MAIL_HOST');
    const mailPort = this.configService.get<number>('MAIL_PORT', 587);
    const isGmail = mailHost?.includes('gmail.com');
    
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      // Use secure: true for port 465 (SSL), false for port 587 (TLS)
      secure: mailPort === 465,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      // Gmail-specific TLS settings
      tls: {
        rejectUnauthorized: this.configService.get<boolean>('MAIL_REJECT_UNAUTHORIZED', true),
        ...(isGmail && {
          ciphers: 'SSLv3',
        }),
      },
    });

    this.logger.log(`Email transporter initialized: ${mailHost}:${mailPort}`);
  }

  async sendRFPEmail(to: string, subject: string, rfpData: any, rfpId: string): Promise<void> {
    try {
      const emailBody = this.formatRFPEmail(rfpData);

      const mailOptions = {
        from: {
          name: this.configService.get<string>('MAIL_FROM_NAME'),
          address: this.configService.get<string>('MAIL_FROM_ADDRESS'),
        },
        to,
        subject,
        html: emailBody,
      };

      await this.transporter.sendMail(mailOptions);

      // Log email
      await this.prisma.emailLog.create({
        data: {
          fromEmail: this.configService.get<string>('MAIL_FROM_ADDRESS'),
          toEmail: to,
          subject,
          body: emailBody,
          direction: EmailDirection.OUTBOUND,
          rfpId,
          processed: true,
        },
      });

      this.logger.log(`RFP email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  private formatRFPEmail(rfpData: any): string {
    const requirements = rfpData.requirements || {};

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #4CAF50; font-size: 18px; margin-bottom: 10px; }
            .requirements { background-color: #f4f4f4; padding: 15px; border-radius: 5px; }
            .footer { background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #4CAF50; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Request for Proposal</h1>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">RFP Title</div>
              <p>${rfpData.title}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Description</div>
              <p>${rfpData.description}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Budget</div>
              <p>$${rfpData.budget?.toLocaleString() || 'Not specified'}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Deadline</div>
              <p>${rfpData.deadline ? new Date(rfpData.deadline).toLocaleDateString() : 'Not specified'}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Requirements</div>
              <div class="requirements">
                ${requirements.items && requirements.items.length > 0 ? `
                  <h4>Items Needed:</h4>
                  <ul>
                    ${requirements.items.map((item: any) => `<li>${typeof item === 'string' ? item : JSON.stringify(item)}</li>`).join('')}
                  </ul>
                ` : ''}
                
                ${requirements.specifications ? `
                  <h4>Specifications:</h4>
                  <pre>${JSON.stringify(requirements.specifications, null, 2)}</pre>
                ` : ''}
                
                ${requirements.deliveryTerms ? `
                  <p><strong>Delivery Terms:</strong> ${requirements.deliveryTerms}</p>
                ` : ''}
                
                ${requirements.paymentTerms ? `
                  <p><strong>Payment Terms:</strong> ${requirements.paymentTerms}</p>
                ` : ''}
                
                ${requirements.warrantyRequirements ? `
                  <p><strong>Warranty Requirements:</strong> ${requirements.warrantyRequirements}</p>
                ` : ''}
              </div>
            </div>
            
            <div class="section">
              <p><strong>Please respond to this email with your proposal including:</strong></p>
              <ul>
                <li>Detailed pricing breakdown</li>
                <li>Delivery timeline</li>
                <li>Warranty information</li>
                <li>Payment terms</li>
                <li>Any additional information or value-added services</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the RFP Management System</p>
            <p>Please reply directly to this email with your proposal</p>
          </div>
        </body>
      </html>
    `;
  }

  async receiveProposalEmail(from: string, subject: string, body: string, rfpId?: string): Promise<any> {
    try {
      // Log incoming email
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

      this.logger.log(`Received proposal email from ${from}`);
      return emailLog;
    } catch (error) {
      this.logger.error(`Error receiving email: ${error.message}`);
      throw error;
    }
  }
}
