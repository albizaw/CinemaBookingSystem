
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using server.Models;
using Microsoft.Extensions.Configuration;


namespace server.Helpers
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmail(Order order)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_config["EmailSettings:From"]));
            email.To.Add(MailboxAddress.Parse(_config["EmailSettings:To"]));
            email.Subject = "Cinema - Albert Zawada";
            email.Body = new TextPart(TextFormat.Html) { Text = $"Hello {order.OrderedUser.FirstName}, your order #ID{order.Id} - {order.OrderedSeance.DateStart} - has been confirmed! " };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_config["EmailSettings:Host"], Int32.Parse(_config["EmailSettings:Port"]));
            await smtp.AuthenticateAsync(_config["EmailSettings:From"], _config["EmailSettings:SmtpPassword"]);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

        }

        public async Task SendCancelEmail(Order order)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_config["EmailSettings:From"]));
            email.To.Add(MailboxAddress.Parse(_config["EmailSettings:To"]));
            email.Subject = "Cinema - Albert Zawada";
            email.Body = new TextPart(TextFormat.Html) { Text = $"Hello {order.OrderedUser.FirstName}, your order #ID{order.Id} {order.OrderedSeance.DateStart} has been cancelled! " };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_config["EmailSettings:Host"], Int32.Parse(_config["EmailSettings:Port"]));
            await smtp.AuthenticateAsync(_config["EmailSettings:From"], _config["EmailSettings:SmtpPassword"]);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

        }
    }
}