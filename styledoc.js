var styledoc = {

  load: function (filename, container) {
	  var client = new XMLHttpRequest();
	  client.open('GET', filename);
	  client.onreadystatechange = function() {
	    if (client.readyState == 4) {
	      generate_styleguide(styledoc_parser.parse(client.responseText), container);
	    }
	  }
	  client.send();

    function generate_styleguide (result, container) {
		  console.log(result);
		  for (var i = 0; i < result.length; i++) {
		    var shortDescription = result[i].shortDescription;
		    var description = result[i].description;
		    var section = lookupTag(result[i].tags, 'section');
		    var pseudos = lookupTag(result[i].tags, 'pseudo');
		    var modifiers = lookupTag(result[i].tags, 'modifier');
		    var markup = lookupTag(result[i].tags, 'markup');
		    var styles = result[i].styles;

		    container.innerHTML += '<div class="element">';
		    // SECTION
		    if (section != null) {
		      container.innerHTML += section.value + ' - ' + section.description + '<br />';
		    }

		    // SHORT DESCRIPTION
		    if (shortDescription != null) {
		      container.innerHTML += '<h3>' + shortDescription + '</h3>';
		    }
		    // DESCRIPTION
		    container.innerHTML += '<p class="description">' + description + '</p>';
    
		    // MARKUP
		    if (markup != null) {	
		      container.innerHTML += '<div id="markupcontainer-' + i + '-default"></div><br />';
		      var elementContainer = document.getElementById('markupcontainer-' + i + '-default');
		      elementContainer.innerHTML = markup.value;
		      var element = elementContainer.lastChild;
		      element.setAttribute('style', styles[0].ruleset);

		      // PSEUDOS
		      if (pseudos != null) {
		        for (var j = 0; j < pseudos.length; j++) {
		          var style = lookupStyle(styles, pseudos[j].value);
		          if (style != null) {
		            container.innerHTML += '<p><code>' + pseudos[j].value + '</code> - ' + pseudos[j].description + '</p>';
		            container.innerHTML += '<div id="markupcontainer-' + i + '-' + pseudos[j].value.replace(':', '') + '"></div><br />';
								var elementContainer = document.getElementById('markupcontainer-' + i + '-' + pseudos[j].value.replace(':', ''));
		            elementContainer.innerHTML = markup.value;
		            var element = elementContainer.lastChild;
		            element.setAttribute('style', styles[0].ruleset + '; ' + style.ruleset);
		          }
		        }
		      }

		      // MODIFIERS
		      if (modifiers != null) {
		        for (var j = 0; j < modifiers.length; j++) {
		          var style = lookupStyle(styles, modifiers[j].value);
		          if (style != null) {
		            container.innerHTML += '<p><code>' + modifiers[j].value + '</code> - ' + modifiers[j].description + '</p>';
		            container.innerHTML += '<div id="markupcontainer-' + i + '-' + modifiers[j].value.replace('.', '') + '"></div><br />';
								var elementContainer = document.getElementById('markupcontainer-' + i + '-' + modifiers[j].value.replace('.', ''));
		            elementContainer.innerHTML += markup.value;
		            var element = elementContainer.lastChild;
		            element.setAttribute('style', styles[0].ruleset + '; ' + style.ruleset);
		          }
		        }
		      }

		    }

		    // MARKUP
				container.innerHTML += '<code>' + markup.value.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>';
		
		    container.innerHTML += '</div><hr />';
		  }
		}

	  function lookupTag (tags, name) {
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
		}

	  function lookupStyle (styles, name) {
		  for (var i = 0; i < styles.length; i++) {
		    if (styles[i].selector.search(name) >= 0) {
			    return styles[i];
		    }
		  }
		}
	
	}
};
