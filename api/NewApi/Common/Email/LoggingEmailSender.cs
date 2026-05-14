using Microsoft.Extensions.Logging;

namespace API.Common.Email;

public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger) => _logger = logger;

    public Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[DEV-EMAIL] To={To} Subject={Subject} ReplyTo={ReplyTo}\n{Body}",
            message.To, message.Subject, message.ReplyTo, message.HtmlBody);
        return Task.CompletedTask;
    }
}
