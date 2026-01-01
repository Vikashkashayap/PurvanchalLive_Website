const axios = require('axios');
const cheerio = require('cheerio');

// Test OG meta tags for a news URL
async function testOGTags(url) {
    try {
        console.log(`🔍 Testing OG tags for: ${url}\n`);

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract meta tags
        const metaTags = {
            title: $('meta[property="og:title"]').attr('content') || $('title').text(),
            description: $('meta[property="og:description"]').attr('content'),
            image: $('meta[property="og:image"]').attr('content'),
            imageType: $('meta[property="og:image:type"]').attr('content'),
            imageWidth: $('meta[property="og:image:width"]').attr('content'),
            imageHeight: $('meta[property="og:image:height"]').attr('content'),
            url: $('meta[property="og:url"]').attr('content'),
            siteName: $('meta[property="og:site_name"]').attr('content'),
            type: $('meta[property="og:type"]').attr('content'),
            twitterCard: $('meta[name="twitter:card"]').attr('content'),
            twitterImage: $('meta[name="twitter:image"]').attr('content')
        };

        console.log('📋 OG Meta Tags:');
        console.log('================');
        Object.entries(metaTags).forEach(([key, value]) => {
            if (value) {
                console.log(`${key}: ${value}`);
            }
        });

        console.log('\n✅ Validation Results:');
        console.log('======================');

        // Validate image
        if (metaTags.image) {
            try {
                const imageResponse = await axios.head(metaTags.image);
                console.log(`🖼️  Image accessible: ✅ (${imageResponse.status})`);
                console.log(`📏 Image type: ${metaTags.imageType || 'Not specified'}`);
            } catch (error) {
                console.log(`🖼️  Image accessible: ❌ (${error.response?.status || 'Error'})`);
            }
        } else {
            console.log('🖼️  Image: ❌ No OG image found');
        }

        // Check required fields
        const requiredFields = ['title', 'description', 'url'];
        requiredFields.forEach(field => {
            if (metaTags[field]) {
                console.log(`📝 ${field}: ✅`);
            } else {
                console.log(`📝 ${field}: ❌ Missing`);
            }
        });

        console.log('\n💡 Recommendations:');
        console.log('===================');
        if (!metaTags.image || !metaTags.image.includes('.png') && !metaTags.image.includes('.jpg')) {
            console.log('- Image format should be JPG or PNG for best compatibility');
        }
        if (metaTags.imageWidth !== '1200' || metaTags.imageHeight !== '630') {
            console.log('- Consider using 1200x630 pixels for optimal social sharing');
        }

    } catch (error) {
        console.error('❌ Error testing URL:', error.message);
    }
}

// Usage example
if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.log('Usage: node test-og.js <news-url>');
        console.log('Example: node test-og.js http://localhost:3000/news/your-news-slug');
        process.exit(1);
    }
    testOGTags(url);
}

module.exports = { testOGTags };
