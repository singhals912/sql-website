const crypto = require('crypto');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Environment Configuration Validator
 * Ensures all critical environment variables are properly set for security
 */

class EnvironmentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate all environment variables
   */
  validate() {
    this.validateJWTSecret();
    this.validateDatabaseSecurity();
    this.validateGeneralSecurity();
    this.validateProductionReadiness();

    if (this.errors.length > 0) {
      console.error('❌ CRITICAL ENVIRONMENT SECURITY ERRORS:');
      this.errors.forEach(error => console.error(`  - ${error}`));
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Production deployment blocked due to security issues');
      }
    }

    if (this.warnings.length > 0) {
      console.warn('⚠️  ENVIRONMENT SECURITY WARNINGS:');
      this.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Environment security validation passed');
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate JWT secret strength
   */
  validateJWTSecret() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      this.errors.push('JWT_SECRET is required');
      return;
    }

    // Check for default/weak secrets
    const weakSecrets = [
      'your_jwt_secret_key_here_change_in_production',
      'secret',
      'jwt_secret',
      'change_me',
      '123456'
    ];

    if (weakSecrets.includes(jwtSecret)) {
      this.errors.push('JWT_SECRET is using a default/weak value - change immediately!');
      return;
    }

    // Check minimum length (should be at least 64 characters for 256-bit security)
    if (jwtSecret.length < 64) {
      this.errors.push(`JWT_SECRET is too short (${jwtSecret.length} chars). Minimum 64 characters required for security.`);
    }

    // Check entropy (rough check for randomness)
    if (this.hasLowEntropy(jwtSecret)) {
      this.warnings.push('JWT_SECRET appears to have low entropy. Consider generating with crypto.randomBytes().');
    }
  }

  /**
   * Validate database security
   */
  validateDatabaseSecurity() {
    const dbPassword = process.env.DB_PASSWORD;
    const executorPassword = process.env.EXECUTOR_DB_PASSWORD;

    // Check main database password
    if (!dbPassword || dbPassword === 'password') {
      this.errors.push('DB_PASSWORD is using default value "password" - change immediately!');
    }

    if (dbPassword && dbPassword.length < 8) {
      this.warnings.push('DB_PASSWORD is shorter than 8 characters');
    }

    // Check executor database password
    if (!executorPassword) {
      this.warnings.push('EXECUTOR_DB_PASSWORD not set - SQL execution sandboxing may not work');
    } else if (executorPassword === 'password' || executorPassword === dbPassword) {
      this.errors.push('EXECUTOR_DB_PASSWORD should be different from main DB_PASSWORD');
    }
  }

  /**
   * Validate general security settings
   */
  validateGeneralSecurity() {
    const sessionSecret = process.env.SESSION_SECRET;
    const nodeEnv = process.env.NODE_ENV;

    if (!sessionSecret) {
      this.warnings.push('SESSION_SECRET not set - session security may be compromised');
    } else if (sessionSecret.length < 32) {
      this.warnings.push('SESSION_SECRET should be at least 32 characters');
    }

    if (!nodeEnv) {
      this.warnings.push('NODE_ENV not set - defaulting to development mode');
    }
  }

  /**
   * Validate production readiness
   */
  validateProductionReadiness() {
    if (process.env.NODE_ENV === 'production') {
      // Additional production-specific checks
      if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
        this.errors.push('FRONTEND_URL must be set to production URL, not localhost');
      }

      if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
        this.warnings.push('RATE_LIMIT_MAX_REQUESTS not set - using default rate limiting');
      }

      if (process.env.DB_HOST === 'localhost') {
        this.warnings.push('DB_HOST is localhost in production - ensure this is intentional');
      }
    }
  }

  /**
   * Simple entropy check for secrets
   */
  hasLowEntropy(str) {
    const uniqueChars = new Set(str.toLowerCase()).size;
    const entropyRatio = uniqueChars / str.length;
    return entropyRatio < 0.3; // If less than 30% unique characters, flag as low entropy
  }

  /**
   * Generate secure random string for secrets
   */
  static generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Validate environment on module load
const validator = new EnvironmentValidator();
const validation = validator.validate();

module.exports = {
  EnvironmentValidator,
  validation,
  generateSecureSecret: EnvironmentValidator.generateSecureSecret
};