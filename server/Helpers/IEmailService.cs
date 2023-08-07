using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Mail;
using MimeKit;
using server.Models;

namespace server.Helpers
{
    public interface IEmailService
    {
        Task SendEmail(Order order);
        Task SendCancelEmail(Order order);
    }
}