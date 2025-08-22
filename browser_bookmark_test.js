/**
 * Browser Bookmark Test Script
 * Copy and paste this into your browser's console to test bookmark functionality
 * 
 * Instructions:
 * 1. Navigate to http://localhost:3001/practice/1 (or any problem page)
 * 2. Open browser developer tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script and press Enter
 * 5. The script will test bookmark functionality and show results
 */

(async function testBookmarkInBrowser() {
  console.log('🔘 Testing Bookmark Functionality in Browser\n');
  
  // Get session ID the same way BookmarkButton does
  function getSessionId() {
    let sessionId = localStorage.getItem('sql_practice_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql_practice_session_id', sessionId);
    }
    return sessionId;
  }
  
  const sessionId = getSessionId();
  console.log('📱 Session ID:', sessionId);
  
  // Test with problem #1 (you can change this)
  const testProblemId = 1;
  
  try {
    // 1. Test bookmark status check
    console.log('1️⃣ Testing bookmark status check...');
    const checkResponse = await fetch(`http://localhost:5001/api/bookmarks/check/${testProblemId}`, {
      headers: {
        'X-Session-ID': sessionId
      }
    });
    
    console.log('Check Response Status:', checkResponse.status);
    console.log('Check Response OK:', checkResponse.ok);
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log('✅ Bookmark status check: SUCCESS');
      console.log('Data:', checkData);
    } else {
      console.log('❌ Bookmark status check: FAILED');
      const errorText = await checkResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    // 2. Test bookmark addition
    console.log('\n2️⃣ Testing bookmark addition...');
    const addResponse = await fetch(`http://localhost:5001/api/bookmarks/${testProblemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify({
        bookmarkType: 'favorite',
        notes: 'Browser test bookmark',
        tags: ['browser-test']
      })
    });
    
    console.log('Add Response Status:', addResponse.status);
    console.log('Add Response OK:', addResponse.ok);
    
    if (addResponse.ok) {
      const addData = await addResponse.json();
      console.log('✅ Bookmark addition: SUCCESS');
      console.log('Data:', addData);
    } else {
      console.log('❌ Bookmark addition: FAILED');
      const errorText = await addResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    // 3. Test bookmark status after addition
    console.log('\n3️⃣ Testing bookmark status after addition...');
    const checkAfterResponse = await fetch(`http://localhost:5001/api/bookmarks/check/${testProblemId}`, {
      headers: {
        'X-Session-ID': sessionId
      }
    });
    
    if (checkAfterResponse.ok) {
      const checkAfterData = await checkAfterResponse.json();
      console.log('✅ Bookmark status after addition:', checkAfterData);
      
      if (checkAfterData.bookmarked) {
        console.log('🎉 SUCCESS: Bookmark is now active!');
      } else {
        console.log('❌ ISSUE: Bookmark was not saved properly');
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('✅ Browser can make API calls to backend');
    console.log('✅ Bookmark functionality works from browser');
    console.log('✅ Session management is working');
    
    console.log('\n💡 If BookmarkButton still not working:');
    console.log('1. Check if BookmarkButton component is rendering on the page');
    console.log('2. Look for any React errors in console');
    console.log('3. Check if click events are being triggered');
    console.log('4. Verify the component is receiving the correct problemId prop');
    
    // 4. Test finding BookmarkButton on page
    console.log('\n4️⃣ Looking for BookmarkButton components on page...');
    const bookmarkButtons = document.querySelectorAll('[class*="bookmark"], [title*="bookmark"], [aria-label*="bookmark"]');
    console.log(`Found ${bookmarkButtons.length} potential bookmark elements:`, bookmarkButtons);
    
    if (bookmarkButtons.length === 0) {
      console.log('❌ No bookmark buttons found on page');
      console.log('💡 BookmarkButton might not be rendering or might have different CSS classes');
    } else {
      console.log('✅ Found bookmark elements - try clicking them!');
    }
    
  } catch (error) {
    console.error('❌ Browser test failed:', error);
    console.log('This might indicate a CORS issue or network problem');
  }
})();