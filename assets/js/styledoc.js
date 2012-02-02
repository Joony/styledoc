(function(jQuery){
  // Instantiate object
  var styledoc = typeof window.styledoc !== 'undefined' ? window.styledoc : new Object();
  
  // Set up language array
  var lang = [
    'No jQuery library found. The front-end for Styledoc depends on it. Without it, it cannot survive!',
    'No object passed to constructor. Unable to proceed.',
    'No container element passed to constructor. Unable to proceed.',
    'Auto-generated Styledoc',
    'Unknown section'
  ];
  
  // Secure jQuery
  var jQuery = typeof jQuery !== 'undefined' ? jQuery : typeof window.jQuery !== 'undefined' ? window.jQuery : false,
  $ = jQuery;
  if ($ === false) throw new Error(lang[0]);
  
  // Utilities
  var stringToSlug = function(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    
    // remove accents, swap ס for n, etc
    var from = "אבהגטיכךלםןמעףצפשתüûסח·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    return str;
  }
  var lookupTag = function(tags, name) {
    var result = [];
    for (var i = 0; i < tags.length; i++) {
      if ((name == 'pseudo' || name == 'modifier') && tags[i].id == name) {
        result.push(tags[i]);
      } else if (tags[i].id == name) {
        result = tags[i];
        break;
      }
    }
    return result.length == 0 ? null : result;
  };
  var lookupStyle = function(styles, name) {
    for (var i = 0; i < styles.length; i++) {
      if (styles[i].selector.search(name) >= 0) {
        return styles[i];
      }
    }
  };
  var createMarkupExample = function(markup, style, modifier, description){
    var $markup = $(markup).attr('style',style.replace(/"/g,'\'')),
    $markupContainer = $('<div class="styledoc-markup" />').append($markup),
    $example = $('<div class="styledoc-example" />').append($markupContainer);
    
    if (typeof description === 'string') $example.prepend($('<span class="styledoc-markup-description">' + description + '</span>'));
    if (typeof modifier === 'string') $example.prepend($('<code class="styledoc-modifier">' + modifier + '</code>'));
    
    return $example;
  };
  
  // Helpers
  var _Styledoc = function(obj,elem,settings){
    // Check for dependencies
    if (typeof obj !== 'object') throw new Error(lang[1]);
    if (typeof elem !== 'object') throw new Error(lang[2]);
    
    // Set up instance settings
    var t = this;
    this.title = lang[3];
    this.header = $('<h1 class="styledoc-header" />');
    this.content = $('<div class="styledoc-content" />');
    this.navigation = $('<div class="styledoc-navigation"></div>');
    
    // Add home navigation
    $('<a href="#styledoc-header">Home</a>')
      .click(function(e){
        e.preventDefault();
        $(this).addClass('active').siblings().removeClass('active');
        t.navigateTo(t.header);
      })
      .prependTo(this.navigation);
    
    // Merge settings (if any)
    if (typeof settings === 'object') $.extend(this,settings);
    
    // Loop through object
    for (var i = 0; i < obj.length; i++) {
      var shortDescription = obj[i].shortDescription,
      description = obj[i].description,
      section = lookupTag(obj[i].tags, 'section'),
      pseudos = lookupTag(obj[i].tags, 'pseudo'),
      modifiers = lookupTag(obj[i].tags, 'modifier'),
      markup = lookupTag(obj[i].tags, 'markup'),
      styles = obj[i].styles,
      slug = stringToSlug('styledoc_' + section.value + '_' + section.description + '_' + i),
      $module = $('<div class="styledoc-module" name="' + slug + '" id="' + slug + '" />');
      
      // Build module content
        // Section info
        var sectionName = lang[5];
        if (section) {
          $('<h6 class="styledoc-section"><span class="styledoc-section-value">' + section.value + '</span> <span class="styledoc-section-description">' + section.description + '</span></h6>').appendTo($module);
          sectionName = section.value + ' - ' + section.description;
        }
        
        // Description
        if (shortDescription) $('<h3 class="styledoc-short-description">' + shortDescription + '</h3>').appendTo($module);
        if (description) $('<p class="styledoc-long-description">' + description + '</p>').appendTo($module);
        
        
        // Example markup
        if (markup) {
          createMarkupExample(markup.value, styles[0].ruleset).appendTo($module);
          if (pseudos) {
            for (var j = 0; j < pseudos.length; j++) {
              var style = lookupStyle(styles, pseudos[j].value);
              if (style) createMarkupExample(markup.value,styles[0].ruleset+style.ruleset,pseudos[j].value,pseudos[j].description).appendTo($module);
            }
          }
          if (modifiers) {
            for (var j = 0; j < modifiers.length; j++) {
              var style = lookupStyle(styles, modifiers[j].value);
              if (style) createMarkupExample(markup.value,styles[0].ruleset+style.ruleset,modifiers[j].value,modifiers[j].description).appendTo($module);
            }
          }
        }
        
      // Insert module content
      this.content.append($module);
      
      // Add to navigation
      $('<a href="#' + slug + '">' + sectionName + '</a>')
        .click(function(e){
          e.preventDefault();
          $(this).addClass('active').siblings().removeClass('active');
          t.navigateTo(t.content.parent().find(e.target.hash));
        })
        .appendTo(this.navigation);
    }
    
    // Insert to the DOM
    $(elem).addClass('styledoc').append(this.header.text(this.title)).append(this.content).append(this.navigation);
  };
  _Styledoc.prototype.navigateTo = function($target){
    if ($target[0]) {
      $('html,body').animate({scrollTop:$target.offset().top},500);
      $target.closest('.styledoc').find('.styledoc-module,.styledoc-header').removeClass('active');
      $target.addClass('active');
    }
  };
  
  // Ajax request
  styledoc.xhr = function(filename, callback){
    var client = new XMLHttpRequest();
    client.open('GET', filename);
    client.onreadystatechange = function() {
      if (client.readyState == 4) {
        callback(client.responseText);
      }
    }
    client.send();
  }
  
  // Load function
  styledoc.load = function (filename, container) {
    this.xhr(filename, function(rt){
      new _Styledoc(styledoc.parser.parse(rt),container);
    });
  };
  
  // Expose to global scope
  window.styledoc = styledoc;
})();
