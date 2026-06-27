const fs = require('fs');
const path = require('path');

const filesToRefactor = [
  'app/developer/areas/page.tsx',
  'app/developer/community/page.tsx',
  'app/developer/gov-projects/page.tsx',
  'app/developer/infrastructure/page.tsx',
  'app/developer/metrics/page.tsx',
  'app/developer/page.tsx',
  'app/developer/properties/page.tsx',
  'app/developer/visit-score/page.tsx',
  'app/mobile/community/page.tsx',
  'app/mobile/profile/page.tsx',
  'components/dashboard/CommunityPanel.tsx',
  'components/dashboard/PropertyListingsPanel.tsx',
  'components/mobile/MobilePropertyFeed.tsx'
];

filesToRefactor.forEach(filePath => {
  const absolutePath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');

  // Replace import
  content = content.replace(
    /import\s+\{\s*createClient\s*\}\s+from\s+["']@supabase\/supabase-js["'];?/g,
    `import { supabase } from "@/lib/supabase";`
  );

  // Replace const supabase = createClient(...)
  content = content.replace(
    /const\s+supabase\s*=\s*createClient\([\s\S]*?\);?/g,
    ''
  );

  // Replace const untypedSupabase = createClient(...)
  content = content.replace(
    /const\s+untypedSupabase\s*=\s*createClient\([\s\S]*?\);?/g,
    'const untypedSupabase = supabase;'
  );

  fs.writeFileSync(absolutePath, content, 'utf8');
  console.log(`Refactored: ${filePath}`);
});
