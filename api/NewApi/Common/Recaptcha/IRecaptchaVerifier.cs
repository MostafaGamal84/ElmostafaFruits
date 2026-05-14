namespace API.Common.Recaptcha;

public interface IRecaptchaVerifier
{
    Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken ct = default);
}

public class NullRecaptchaVerifier : IRecaptchaVerifier
{
    public Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken ct = default) => Task.FromResult(true);
}
