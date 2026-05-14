using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace API.Common.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpEmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpEmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
    {
        ValidateOptions();
        Exception? lastException = null;
        var portsToTry = GetPortsToTry().ToArray();

        foreach (var port in portsToTry)
        {
            ct.ThrowIfCancellationRequested();

            using var mail = CreateMailMessage(message);
            using var smtp = CreateSmtpClient(port);
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeoutCts.CancelAfter(_options.TimeoutMs);

            _logger.LogInformation(
                "Sending email to {To} via {Host}:{Port} (SSL={EnableSsl}, AuthUser={Username}, TimeoutMs={TimeoutMs})",
                message.To, _options.Host, port, _options.EnableSsl, _options.Username, _options.TimeoutMs);

            try
            {
                await smtp.SendMailAsync(mail, timeoutCts.Token);
                _logger.LogInformation("Email delivered to SMTP relay for {To} (Subject={Subject})", message.To, message.Subject);
                return;
            }
            catch (OperationCanceledException ex) when (!ct.IsCancellationRequested && timeoutCts.IsCancellationRequested)
            {
                lastException = new TimeoutException(
                    $"SMTP timeout while sending via {_options.Host}:{port} after {_options.TimeoutMs}ms.",
                    ex);

                _logger.LogWarning(ex,
                    "SMTP timeout while sending to {To} via {Host}:{Port}",
                    message.To, _options.Host, port);
            }
            catch (SmtpException ex)
            {
                lastException = ex;
                _logger.LogWarning(ex,
                    "SMTP failure while sending to {To} via {Host}:{Port}. StatusCode={StatusCode}",
                    message.To, _options.Host, port, ex.StatusCode);
            }
            catch (Exception ex)
            {
                lastException = ex;
                _logger.LogWarning(ex,
                    "Unexpected SMTP error while sending email to {To} via {Host}:{Port}",
                    message.To, _options.Host, port);
            }
        }

        throw new InvalidOperationException(
            $"Failed to send email to {message.To} via {_options.Host}. Tried ports: {string.Join(", ", portsToTry)}.",
            lastException);
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            throw new InvalidOperationException("SMTP host is not configured. Set Email:Smtp:Host.");
        }

        if (_options.Port <= 0)
        {
            throw new InvalidOperationException("SMTP port is not configured. Set Email:Smtp:Port.");
        }

        if (_options.TimeoutMs <= 0)
        {
            throw new InvalidOperationException("SMTP timeout is not configured correctly. Set Email:Smtp:TimeoutMs to a positive number.");
        }

        if (string.IsNullOrWhiteSpace(_options.FromEmail))
        {
            throw new InvalidOperationException("SMTP from email is not configured. Set Email:Smtp:FromEmail.");
        }

        if (_options.RequiresAuthentication &&
            (string.IsNullOrWhiteSpace(_options.Username) || string.IsNullOrWhiteSpace(_options.Password)))
        {
            throw new InvalidOperationException("SMTP credentials are not configured. Set Email:Smtp:Username and Email:Smtp:Password.");
        }
    }

    private MailMessage CreateMailMessage(EmailMessage message)
    {
        var mail = new MailMessage
        {
            From = new MailAddress(_options.FromEmail, _options.FromName),
            Subject = message.Subject,
            Body = message.HtmlBody,
            IsBodyHtml = true
        };

        mail.To.Add(message.To);

        if (!string.IsNullOrWhiteSpace(message.ReplyTo))
        {
            mail.ReplyToList.Add(message.ReplyTo);
        }

        return mail;
    }

    private SmtpClient CreateSmtpClient(int port)
    {
        var smtp = new SmtpClient(_options.Host, port)
        {
            DeliveryMethod = SmtpDeliveryMethod.Network,
            EnableSsl = _options.EnableSsl,
            UseDefaultCredentials = false,
            Timeout = _options.TimeoutMs
        };

        if (_options.RequiresAuthentication)
        {
            smtp.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        return smtp;
    }

    private IEnumerable<int> GetPortsToTry()
    {
        yield return _options.Port;

        foreach (var port in _options.FallbackPorts.Where(x => x > 0 && x != _options.Port).Distinct())
        {
            yield return port;
        }
    }
}
