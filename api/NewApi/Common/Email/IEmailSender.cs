namespace API.Common.Email;

public record EmailMessage(string To, string Subject, string HtmlBody, string? ReplyTo = null);

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct = default);
}
