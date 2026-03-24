namespace POS.Main.Core.Exceptions;

/// <summary>
/// Base exception for authentication-related errors
/// </summary>
public class AuthenticationException : Exception
{
    public AuthenticationException() : base("Authentication failed")
    {
    }

    public AuthenticationException(string message) : base(message)
    {
    }

    public AuthenticationException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}

/// <summary>
/// Exception thrown when credentials are invalid
/// </summary>
public class InvalidCredentialsException : AuthenticationException
{
    public InvalidCredentialsException()
        : base("Invalid username or password")
    {
    }

    public InvalidCredentialsException(string message) : base(message)
    {
    }
}

/// <summary>
/// Exception thrown when account is locked
/// </summary>
public class AccountLockedException : AuthenticationException
{
    public DateTime? LockedUntil { get; set; }

    public AccountLockedException(DateTime? lockedUntil = null)
        : base("Account is locked due to multiple failed login attempts")
    {
        LockedUntil = lockedUntil;
    }

    public AccountLockedException(string message, DateTime? lockedUntil = null)
        : base(message)
    {
        LockedUntil = lockedUntil;
    }
}

/// <summary>
/// Exception thrown when account is disabled
/// </summary>
public class AccountDisabledException : AuthenticationException
{
    public AccountDisabledException()
        : base("Account has been disabled. Please contact administrator")
    {
    }

    public AccountDisabledException(string message) : base(message)
    {
    }
}

/// <summary>
/// Exception thrown when account is locked by admin
/// </summary>
public class AccountLockedByAdminException : AuthenticationException
{
    public DateTime? AutoUnlockDate { get; set; }

    public AccountLockedByAdminException(DateTime? autoUnlockDate = null)
        : base("บัญชีถูกล็อคโดยผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบ")
    {
        AutoUnlockDate = autoUnlockDate;
    }
}

/// <summary>
/// Exception thrown when refresh token is invalid
/// </summary>
public class InvalidRefreshTokenException : AuthenticationException
{
    public InvalidRefreshTokenException()
        : base("Invalid or expired refresh token")
    {
    }

    public InvalidRefreshTokenException(string message) : base(message)
    {
    }
}
