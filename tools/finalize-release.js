import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

/**
 * This script finalizes a release by committing the updated package.json files
 * in the /examples directory. It reads the main package version and uses it
 * in the commit message.
 */
const main = () => {
  try {
    // Resolve the absolute path to the root package.json
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const { version } = packageJson;

    if (!version) {
      console.error('❌ Error: Could not find version in the root package.json');
      process.exit(1);
    }

    const commitMessage = `chore(release): Fully release ${version}`;

    console.log('📦 Staging example package.json files...');
    // The glob pattern should work in most shells where git is run
    execSync('git add examples/*/package.json examples/*/package-lock.json');
    console.log('✅ Files staged successfully.');

    console.log(`📝 Committing with message: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`);
    console.log('✅ Commit successful.');

    console.log('\n🎉 Release finalization complete!');

  } catch (error) {
    console.error('❌ An error occurred during the release finalization process:');
    
    // Check if the error is from git and if it's because there are no changes to commit
    const stdout = error.stdout?.toString() || '';
    if (stdout.includes('nothing to commit') || stdout.includes('no changes added to commit')) {
        console.warn('🤔 Warning: No changes to commit. The example package.json files may already be up to date.');
    } else {
        // Log the actual error message for other issues
        console.error(error.message);
    }
    // Exit with a non-zero code to indicate a problem, even if it's just a warning
    process.exit(1);
  }
};

main();
