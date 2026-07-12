const fs = require('fs');
const path = require('path');

const publicDir = 'E:/Google Antigravity/Новая папка/Website_Public';

function checkImages() {
    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
    
    let totalImages = 0;
    let missingSrc = [];
    let missingDataFull = [];

    files.forEach(file => {
        const filePath = path.join(publicDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find all img tags
        const imgRegex = /<img[^>]+>/g;
        let match;
        
        while ((match = imgRegex.exec(content)) !== null) {
            const imgTag = match[0];
            
            // We mainly care about gallery-img, but let's check all
            const srcMatch = imgTag.match(/src="([^"]+)"/);
            const dataFullMatch = imgTag.match(/data-full="([^"]+)"/);
            
            if (srcMatch) {
                totalImages++;
                let src = srcMatch[1];
                // strip query params if any
                src = src.split('?')[0];
                const absPath = path.join(publicDir, src);
                if (!fs.existsSync(absPath)) {
                    missingSrc.push({ file, src });
                }
            }
            
            if (dataFullMatch) {
                let df = dataFullMatch[1];
                df = df.split('?')[0];
                const absPath = path.join(publicDir, df);
                if (!fs.existsSync(absPath)) {
                    missingDataFull.push({ file, src: df });
                }
            }
        }
    });

    console.log(`Total images checked: ${totalImages}`);
    
    if (missingSrc.length > 0) {
        console.log('\n--- MISSING SRC FILES ---');
        missingSrc.forEach(m => console.log(`${m.file} -> ${m.src}`));
    } else {
        console.log('\nNo missing src files found!');
    }
    
    if (missingDataFull.length > 0) {
        console.log('\n--- MISSING DATA-FULL FILES ---');
        missingDataFull.forEach(m => console.log(`${m.file} -> ${m.src}`));
    } else {
        console.log('\nNo missing data-full files found!');
    }
}

checkImages();
