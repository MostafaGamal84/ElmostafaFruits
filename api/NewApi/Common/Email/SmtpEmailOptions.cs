namespace API.Common.Email;

public class SmtpEmailOptions
{
    public const string SectionName = "Email:Smtp";

    public bool Enabled { get; set; } = true;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 25;
    public int[] FallbackPorts { get; set; } = [];
    public int TimeoutMs { get; set; } = 15000;
    public bool EnableSsl { get; set; }
    public bool RequiresAuthentication { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
}
