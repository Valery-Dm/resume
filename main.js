$(document).ready(function() {
  "use strict";
  var menu = $(".navbar"),
      menuHeight = menu.outerHeight(),
      menuItems = menu.find("a"),
      sectionIds = menuItems.map(function() {
        return $(this).attr("href");
      }),
      scrollPositions = getScrollPositions(),
      lastId = sectionIds.length - 1,
      preLastId = sectionIds.length - 2,
      currentId = 0,
      currentPosTop = scrollPositions[currentId],
      currentPosBottom = getPosBottom(currentId),
      animationDelay = 300,
      lastSectionThreshold = 50,
      topEdgeCorrection = 20,
      windowResized = false;
  // Go to the top on document open
  $(this).scrollTop(0);
  // Track window resizing events as we might need
  // to recalculate scrollPositions after that
  $(window).resize(function() {
    windowResized = true;
  });
  // Scroll on click
  menuItems.click(function(e) {
    var href = $(this).attr("href"),
      offset = $(href).offset().top;
    $('html, body').stop().animate({
      scrollTop: offset
    }, animationDelay);
    e.preventDefault();
  });
  // Track scrolling
  $(window).scroll(function() {
    setActiveMenu();
  });
  // Bootstrap helper to really collapse 'collapsed' menu after click.
  // It is strange that so desireable function has no Bootstrap support.
  $(window).click('.in', function(e) {
    if($(e.target).is('a')) {
        $('.in').attr("aria-expanded", "false");
        $('.in').removeClass("in");
    }
  });
  /**
  * Set new menu item as Active based on current Window position
  */
  function setActiveMenu() {
    var i;
    if (windowResized) {
      // reset after possible window resize
      scrollPositions = getScrollPositions();
      windowResized = false;
    }
    // Get top Window edge that is just under the Menu
    var topEdge = $(window).scrollTop() + menuHeight;
    // Special case: last section, don't switch black to
    // previous one immediatelly (avoid menu blinking).
    if (currentId == lastId && isThreshold(topEdge)) {
      return;
    }
    // explicitly set last section (as it has small height
    // and can't be selected otherwise inside a big window)
    else if (isPageEndReached(topEdge + $(window).height())) {
      setNewPosition(lastId);
    }
    // Going or scrolling down
    else if (topEdge > currentPosBottom) {
      for (i = currentId; i < scrollPositions.length; i++) {
        // we are looking for bottom edge here
        if (topEdge < getPosBottom(i)) {
          setNewPosition(i);
          return;
        }
      }
    }
    // Going up
    else if (topEdge < currentPosTop) {
      for (i = currentId; i >= 0; i--) {
        // is Window's top edge below this section's top?
        if (topEdge > scrollPositions[i]) {
          setNewPosition(i);
          return;
        }
      }
    }
  }

  /**
  * The new section will be active and selected
  */
  function setNewPosition(newId) {
    resetActiveMenu(newId);
    currentPosTop = scrollPositions[currentId] - topEdgeCorrection;
    currentPosBottom = getPosBottom(currentId);
  }

  /**
  * Return collection of top edge offsets for all sections
  */
  function getScrollPositions() {
    return sectionIds.map(function() {
            return $(this).offset().top;
          });
  }

  /**
  * Remove Active status from currently selected item
  * and give it to new one
  */
  function resetActiveMenu(newId){
    $(menuItems[currentId]).parent().removeClass("active");
    currentId = newId;
    $(menuItems[currentId]).parent().addClass("active");
  }

  /**
  * Return true when scrolling reached window bottom
  */
  function isPageEndReached(currentHeight) {
    return currentId == preLastId &&
           currentHeight >= $(document).height();
  }

  /**
  * Threshold for the last section to stay active a little bit
  */
  function isThreshold(topEdge) {
    return topEdge + $(window).height() + lastSectionThreshold > $(document).height();
  }
  /**
  * Get bottom edge of a section with given id
  * (which is the top edge of next section)
  * or the window's bottom for the last section
  */
  function getPosBottom(id) {
    return ++id < scrollPositions.length ?
          scrollPositions[id] : $(document).height();
  }
});
