var cssdoc = {

  load: function (filename) {
	  var client = new XMLHttpRequest();
	  client.open('GET', filename);
	  client.onreadystatechange = function() {
	    if (client.readyState == 4) {
	      generate_styleguide(cssdoc_parser.parse(client.responseText));
	    }
	  }
	  client.send();

    function generate_styleguide (result) {
		  console.log(result);
		  for (var i = 0; i < result.length; i++) {
		    var shortDescription = result[i].shortDescription;
		    var description = result[i].description;
		    var section = lookupTag(result[i].tags, 'section');
		    var pseudos = lookupTag(result[i].tags, 'pseudo');
		    var modifiers = lookupTag(result[i].tags, 'modifier');
		    var markup = lookupTag(result[i].tags, 'markup');
		    var styles = result[i].styles;

		    document.write('<div class="element">');
		    // SECTION
		    if (section != null) {
		      document.write(section.value + ' - ' + section.description + '<br />');
		    }

		    // SHORT DESCRIPTION
		    if (shortDescription != null) {
		      document.write('<h3>' + shortDescription + '</h3>');
		    }
		    // DESCRIPTION
		    document.write('<p class="description">' + description + '</p>');
    
		    // MARKUP
		    if (markup != null) {	
		      document.write('<div id="markupcontainer-' + i + '-default">');
		      document.write(markup.value);
		      document.write('</div><br />');
		      var element = document.getElementById('markupcontainer-' + i + '-default').lastChild;
		      element.setAttribute('style', styles[0].ruleset);

		      // PSEUDOS
		      if (pseudos != null) {
		        for (var j = 0; j < pseudos.length; j++) {
		          var style = lookupStyle(styles, pseudos[j].value);
		          if (style != null) {
		            document.write('<p><code>' + pseudos[j].value + '</code> - ' + pseudos[j].description + '</p>');
		            document.write('<div id="markupcontainer-' + i + '-' + pseudos[j].value.replace(':', '') + '">');
		            document.write(markup.value);
		            document.write('</div><br />');
		            var element = document.getElementById('markupcontainer-' + i + '-' + pseudos[j].value.replace(':', '')).lastChild;
		            element.setAttribute('style', styles[0].ruleset + '; ' + style.ruleset);
		          }
		        }
		      }

		      // MODIFIERS
		      if (modifiers != null) {
		        for (var j = 0; j < modifiers.length; j++) {
		          var style = lookupStyle(styles, modifiers[j].value);
		          if (style != null) {
		            document.write('<p><code>' + modifiers[j].value + '</code> - ' + modifiers[j].description + '</p>');
		            document.write('<div id="markupcontainer-' + i + '-' + modifiers[j].value.replace('.', '') + '">');
		            document.write(markup.value);
		            document.write('</div><br />');
		            var element = document.getElementById('markupcontainer-' + i + '-' + modifiers[j].value.replace('.', '')).lastChild;
		            element.setAttribute('style', styles[0].ruleset + '; ' + style.ruleset);
		          }
		        }
		      }

		    }

		    // MARKUP
				document.write('<code>' + markup.value.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>');
		
		    document.write('</div><hr />');
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
