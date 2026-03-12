namespace POS.Main.Core.Exceptions;

public class ValidationException : Exception
{
    public Dictionary<string, string[]>? Errors { get; }

    public ValidationException(string message) : base(message)
    {
    }

    public ValidationException(string message, Dictionary<string, string[]> errors)
        : base(message)
    {
        Errors = errors;
    }

    public ValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
