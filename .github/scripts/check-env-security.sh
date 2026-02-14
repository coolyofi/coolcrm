#!/bin/bash
# Security check: Ensure NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is not present
# This prevents accidental exposure of service role key to the browser

set -e

echo "🔒 Checking for security issues in environment configuration..."

# Check for the dangerous variable name in configuration files
DANGEROUS_VAR="NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
FILES_TO_CHECK=(
  ".env.local.example"
  ".env.example"
)

FOUND_ISSUES=0

# Check configuration files - these should never have the dangerous variable
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    if grep -q "$DANGEROUS_VAR" "$file"; then
      echo "❌ ERROR: Found $DANGEROUS_VAR in $file"
      echo "   This variable name will expose the service role key to the browser!"
      echo "   Use SUPABASE_SERVICE_ROLE_KEY instead (without NEXT_PUBLIC_ prefix)"
      FOUND_ISSUES=1
    fi
  fi
done

# Check TypeScript/JavaScript files that might try to access it
# Allow documentation files (README.md, SECURITY_GUIDE.md) to mention it as a bad example
if grep -r "$DANGEROUS_VAR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v "node_modules" | grep -v ".next" | grep -v "check-env-security.sh"; then
  echo "❌ ERROR: Found $DANGEROUS_VAR in source code!"
  echo "   Service role key should only be accessed via SUPABASE_SERVICE_ROLE_KEY"
  FOUND_ISSUES=1
fi

if [ $FOUND_ISSUES -eq 0 ]; then
  echo "✅ No security issues found - service role key configuration is correct"
  exit 0
else
  echo ""
  echo "⚠️  SECURITY CHECK FAILED"
  echo "   Please fix the issues above before continuing."
  echo "   Remember: NEXT_PUBLIC_ prefix exposes variables to the browser!"
  exit 1
fi
