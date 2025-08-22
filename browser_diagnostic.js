/**
 * Browser Diagnostic Script
 * Paste this into browser console to diagnose Progress page issue
 * 
 * Instructions:
 * 1. Open your browser (where you've been solving problems)
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 * 5. Check the output for diagnosis
 */

console.log('🔍 BROWSER DIAGNOSTIC FOR PROGRESS PAGE ISSUE\n');

// Check localStorage for session ID
const sessionId = localStorage.getItem('sql_practice_session_id');
console.log('📱 Current Session ID in localStorage:', sessionId);

if (!sessionId) {
  console.log('❌ NO SESSION ID FOUND in localStorage');
  console.log('💡 This is likely the issue - no session means no progress tracking');
  console.log('🔧 Try solving a problem first, then check progress page');
} else {
  console.log('✅ Session ID found in localStorage');
  
  // Test the session with backend
  console.log('\n🔌 Testing session with backend...');
  
  fetch('http://localhost:5001/api/progress/overview', {
    headers: {
      'X-Session-ID': sessionId
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('\n📊 Progress API Response:');
    console.log('   Success:', data.success);
    console.log('   Progress Data:', data.progress?.overview);
    
    if (data.success && data.progress?.overview?.completed > 0) {
      console.log('\n✅ SUCCESS: Your session has progress data!');
      console.log('   Completed problems:', data.progress.overview.completed);
      console.log('   Total attempts:', data.progress.overview.attempted);
      console.log('\n💡 If Progress page still shows "No Progress Yet":');
      console.log('   1. Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)');
      console.log('   2. Check browser console for JavaScript errors');
      console.log('   3. Clear browser cache and try again');
    } else if (data.success && data.progress?.overview?.completed === 0) {
      console.log('\n❌ ISSUE: No progress found for your session');
      console.log('   This session exists but has no completed problems');
      console.log('\n🔧 To fix this:');
      console.log('   1. Go to a practice page (e.g., /practice/1)');
      console.log('   2. Run any SQL query successfully');
      console.log('   3. Return to progress page');
    } else {
      console.log('\n❌ ISSUE: API call failed');
      console.log('   Error:', data.error || 'Unknown error');
      console.log('\n🔧 This might be a backend connection issue');
    }
  })
  .catch(error => {
    console.log('\n❌ NETWORK ERROR:', error.message);
    console.log('💡 Backend might not be running or accessible');
    console.log('🔧 Check if http://localhost:5001 is accessible');
  });
}

// Check if we're on the right domain
console.log('\n🌐 Current URL:', window.location.href);
if (!window.location.href.includes('localhost:3001')) {
  console.log('⚠️  WARNING: Not on localhost:3001 - make sure you\'re on the right frontend');
}

// Check browser storage
console.log('\n💾 localStorage contents:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key.includes('sql') || key.includes('session') || key.includes('progress')) {
    console.log(`   ${key}: ${localStorage.getItem(key)}`);
  }
}

console.log('\n🏁 Diagnostic complete. Check the results above for next steps.');