window.addEventListener("load",add_button);
const AZ_PROBLEM_KEY="AZ_PROBLEM_KEY";
const imgURL=chrome.runtime.getURL("assets/bookmark.png");

// // 2. Set up the Observer to watch the body for changes
// const observer = new MutationObserver((mutations, obs) => {
//     const targetExists = document.getElementsByClassName("font-rubik text-fg-grey-primary text-xl leading-[130%] font-bold")[0];
    
//     if (targetExists) {
//         add_button();
//         // Optional: Stop observing once the button is added to save memory
//         obs.disconnect(); 
//     }
// });

const observer = new MutationObserver(() => {
    const buttonMissing = !document.getElementById("my-button");
    // 3. If the target is there, but your button got deleted, put it back
    if (buttonMissing) {
        add_button();
    }
});

// 3. Start watching
observer.observe(document.body, {
    childList: true,
    subtree: true
});

add_button();

function OnProblemsPage(){
    const res=window.location.pathname.startsWith("/problems/");
    // console.log(res);
    return res;
}

function add_button(){

      if(!OnProblemsPage() || document.getElementById("my-button")) return;

      const myBookmark_btn=document.createElement("img");
      myBookmark_btn.src=imgURL;
      myBookmark_btn.style.cursor="pointer";
      myBookmark_btn.id="my-button";
      myBookmark_btn.style.width="25px";
      myBookmark_btn.style.height="25px";
      myBookmark_btn.alt = "Bookmark this problem";
      myBookmark_btn.title = "Click to bookmark this problem";

      const mytarget=document.getElementsByClassName("font-rubik text-fg-grey-primary text-xl leading-[130%] font-bold")[0];
      if(!mytarget) return;
      mytarget.parentNode.insertAdjacentElement("afterend", myBookmark_btn);

      myBookmark_btn.addEventListener("click",add_bookmarks);

}

async function add_bookmarks(){

      const myURL=window.location.href;
      const uniqueId=extract(myURL);
      const problemTitle=document.getElementsByClassName("font-rubik text-fg-grey-primary text-xl leading-[130%] font-bold")[0].textContent;

      const bookmark_obj={
           "id":uniqueId,
           "url":myURL,
           "Title":problemTitle
      }

      const currentBookmarks=await getCurrentBookmarks();
      if(currentBookmarks.some((bookmark) => bookmark.id === uniqueId)) return;

      //set the storage 
      const updatedBookmarks=[...currentBookmarks,bookmark_obj];
      chrome.storage.sync.set({AZ_PROBLEM_KEY: updatedBookmarks}, () => {
          console.log("Updated the bookmarks correctly to ", updatedBookmarks);
      })      

}


function getCurrentBookmarks() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
            resolve(results[AZ_PROBLEM_KEY] || []); 
        });
    });
}


function extract(url) {
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?", start);
    return end === -1 ? url.substring(start) : url.substring(start, end);
}