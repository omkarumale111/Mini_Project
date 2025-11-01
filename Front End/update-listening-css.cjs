const fs = require('fs');
const path = require('path');

const listeningDir = path.join(__dirname, 'src', 'pages', 'listening');
const files = fs.readdirSync(listeningDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(listeningDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if Listening.css is already imported
  if (!content.includes("import './Listening.css';")) {
    // Add the import after Lesson.css import
    content = content.replace(
      "import '../lessons/Lesson.css';",
      "import '../lessons/Lesson.css';\nimport './Listening.css';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped (already has import): ${file}`);
  }
});

console.log('\n🎉 All listening lesson files updated with CSS imports!');
