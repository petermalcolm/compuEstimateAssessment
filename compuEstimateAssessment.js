/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at compuEstimateAssessment.html)
 */
function CompuEstimateAssessment(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 */
CompuEstimateAssessment.prototype.render = function() {
        var that = this;  // alias the compuEstimateAssessment object for reference in callbacks
        
	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
        //load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	
	if(latestState != null) {
		/*
		 * get the response from the latest state. the response variable is
		 * just provided as an example. you may use whatever variables you
		 * would like from the state object (look at compuEstimateAssessmentState.js)
		 */
		var latestWordsResponse = latestState.wordsResponse;            // text: WORDS
		var latestSymbolsResponse = latestState.symbolsResponse;        // text: SYMBOLS
                var latestDoAdjust = latestState.doAdjust;                      // boolean: ADJUST?
                var latestAdjustmentResponse = latestState.adjustmentResponse;  // text: ADJUSTMENT
		var latestEstimateResponse = latestState.estimateResponse;      // text: ESTIMATE
		
		//set the previous student work into the text areas
		$('#wordsTextArea').val(latestWordsResponse); 
		$('#symbolsTextArea').val(latestSymbolsResponse); 
                $('#adjustmentTextArea').val(latestAdjustmentResponse);
		$('#estimateTextArea').val(latestEstimateResponse);
                
            // set the checkmark and visibility of the adjustment response area accordingly:
            if(latestDoAdjust) {
                $("form input:checkbox").prop('checked',true);
                $('#adjustmentDescriptionDiv').css('display','block');
            }
	}
        
        /*
         * respond to user's clicks on the numberpad.  This maps
         * to the corresponding numbers and chains off to the appendSymbolFromNumberpad() method
         */
        $('#numberpad').click(function (e) {
            var offset = $(this).offset();
            var xCoord = (e.clientX - offset.left);
            var yCoord = (e.clientY - offset.top);
            that.appendSymbolFromNumberpad(that.getSymbolFromNumberpadCoords(xCoord, yCoord));
            //alert("width: " + ($(this).width()) + "height: " + ($(this).height()) + "\nx: " + (e.clientX - offset.left) + "  y: " + (e.clientY - offset.top));
        });

        /*
         * respond to user's keystrokes in the symbols text area.  This maps
         * to the corresponding numbers and chains off to the respondToSymbolPress() method
         */

        $("#symbolsTextArea").bind('keyup',function(e){ // Listen for a key pressed via text input
            that.respondToSymbolKeyPress($("#symbolsTextArea").val(),e);
        });
        
        /**
         * respond to the user clicking the adjustment checkbox
         */
        $('#adjustmentCheckbox').bind('change',function(e){
            that.toggleAdjustmentBox();
        });
        
};


/**
 * Appends acceptable symbols to the textArea for numbers and symbols.  Deletes or ignores others
 */
CompuEstimateAssessment.prototype.respondToSymbolKeyPress = function(newContent,event) {
    // skip this if backspace was pressed
    if(8 == event.keyCode) return;
    
    // skip this if there is no data (e.g., deleted all characters)
    if(newContent.length == 0) return;
    
    // extract the last character:
    var lastChar = newContent.charAt(newContent.length-1);

    if( '=' == lastChar){ // insert a newline before an equals sign for clarity
        var whatToAdd = (newContent.length == 1)?'=':'\n='
        $('#symbolsTextArea').val(newContent.substring(0,newContent.length-1) + whatToAdd);
    }
    
    // regular expression of all acceptable characters
    var acceptableRegex = /[\d\.\(\)\+\-\*\/=\s]/;  // digits, dots, parens, plus, minus, asterisk, fwd-slash, equals, whitespace

    if(acceptableRegex.test(lastChar)) {
        // if this is acceptable, check to see if the entire text is a parsable expression yet
        this.showValidationNote();
    
        // $('#symbolResponseParagraph').html(lastChar + ': ok');
    } else {
        // eliminate the character
        $('#symbolsTextArea').val(newContent.substring(0,newContent.length-1));
        
        // $('#symbolResponseParagraph').html(lastChar + ': not ok');
    }
}

/**
 * Evaluates a series of equations, separated by '=' and almost equals signs
 * Returns true iff all of the equations are parsable
 */
CompuEstimateAssessment.prototype.isMathParsable = function(inputString) {
        // replace all instances of the division sign with /
        inputString = inputString.replace("\u00f7","/");
        
        // replace all instances of the times sign with *
        inputString = inputString.replace("\u00d7","*");
    
        // separate the inputString into separate subExpressions:
        var subExpressions = inputString.split(/[=\u2248]/);
        
        // boolean to see if all of them are ok so far
        var okSoFar = true;
        
        // loop thru each, check for syntax errors
        subExpressions.forEach(function(thisExpression){
            try {
                eval(thisExpression); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    okSoFar = false;
                }
            }
        });
    return okSoFar;
}

/**
 * Shows the user whether what they are doing valid so far
 */

CompuEstimateAssessment.prototype.showValidationNote = function() {
    if(this.isMathParsable($('#symbolsTextArea').val())) {
        $('#symbolResponseParagraph').css('color', 'darkslategray');
        $('#symbolResponseParagraph').html('OK');
    } else {
        $('#symbolResponseParagraph').css('color', 'red');
        $('#symbolResponseParagraph').html('incomplete answer');
    }
}

/**
 * Appends a symbol to the textArea for numbers and symbols
 */
CompuEstimateAssessment.prototype.appendSymbolFromNumberpad = function(newSymbol) {
    
    var textArea = $('#symbolsTextArea');
    if('d' == newSymbol){                   // division
        textArea.val(function(i, val) {
            return val + "\u00f7";
        });
    } else if('t' == newSymbol){            // times
        textArea.val(function(i, val) {
            return val + "\u00d7";
        });
    } else if('a' == newSymbol){            // almost equals
        textArea.val(function(i, val) {     
            if(textArea.val().length == 0) {    // no newline if it's blank
                return "\u2248";
            } else {                            // yes newline if there's stuff there already
                return val + "\n\u2248";
            }
        });
    } else if('=' == newSymbol){            // equals
        textArea.val(function(i, val) {     
            if(textArea.val().length == 0) {    // no newline if it's blank
                return "=";
            } else {                            // yes newline if there's stuff there already
                return val + "\n=";
            }
        });
    } else if ('b' == newSymbol) {          // backspace
        if(textArea.val().length == 0) {    // skip it if it's blank
            return;
        }        
        textArea.val(textArea.val().substring(0,textArea.val().length - 1));
    } else if ('c' == newSymbol) {          // clear
        textArea.val("");
    } else {
        textArea.val(textArea.val() + newSymbol);
    }
    
    // check to see if the expression makes sense so far
    this.showValidationNote();
}

 /**
  * Decodes a symbol from the image map for the numberpad (numberpad_approx_equals.png)
  * WIDTH: 191
  * HEIGHT: 197
  */
CompuEstimateAssessment.prototype.getSymbolFromNumberpadCoords = function(xCoord, yCoord) {
    var WIDTH = 191;
    var HEIGHT = 197;
    var symbolSet = ['7','8','9','d',
                     '4','5','6','t',
                     '1','2','3','-',
                     '0','.','p','+',
                     'a','=','b','c'];
    var xIndex = Math.abs(((xCoord / WIDTH) * 4 - 0.5).toFixed(0));                         // integer division on X
    var yIndex = Math.abs(((yCoord / HEIGHT) * 5 - 0.5).toFixed(0));                        // integer division on Y
    var index = (xIndex + yIndex * 4);
    // alert("clicked xIndex: " + xIndex + "  yIndex: " + yIndex + "\n index: " + index);
    // alert("clicked: " + symbolSet[index] + "  xCoord: " + xCoord);

    newSymbol = symbolSet[index];
    
    // special case for parentheses:
    if('p' == newSymbol) {
        if(xCoord < 117){
            newSymbol = '(';
        } else {
            newSymbol = ')';
        }
    }

    return newSymbol;
}

/**
 * toggle the box to let students make a final adjustment to their estimates
 */

CompuEstimateAssessment.prototype.toggleAdjustmentBox = function() {
    if(false == $("form input:checkbox").prop('checked')) {
        $('#adjustmentDescriptionDiv').css('display','none');
    } else {
        $('#adjustmentDescriptionDiv').css('display','block');
    }
}


/**
 * This function retrieves the latest student work
 *
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
CompuEstimateAssessment.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at compuEstimateAssessment.html).
 */
CompuEstimateAssessment.prototype.save = function() {
	//get the answers the student wrote
	// var response = $('#studentResponseTextArea').val();
        var problemName = this.content.problemName;                             // for book-keeping. makes analysis easier
	var wordsResponse = $('#wordsTextArea').val();                          // the WORDS response the student wrote
	var symbolsResponse = $('#symbolsTextArea').val();                      // the SYMBOLS response the student wrote
        var doAdjust = $("form input:checkbox").prop('checked');                // current T/F status of the adjustment checkbox
        var adjustmentResponse = $('#adjustmentTextArea').val();                // the ADJUSTMENT response
	var estimateResponse = $('#estimateTextArea').val();                    // the ESTIMATE response
	
        // alert('saving ... doAdjust is: ' + doAdjust);
        
	/*
	 * create the student state that will store the new work the student
	 * just submitted
	 */
	var compuEstimateAssessmentState = new CompuEstimateAssessmentState(problemName,
                                                                            wordsResponse, 
                                                                            symbolsResponse, 
                                                                            doAdjust,
                                                                            adjustmentResponse,
                                                                            estimateResponse);
	
	/*
	 * fire the event to push this state to the global view.states object.
	 * the student work is saved to the server once they move on to the
	 * next step.
	 */
	eventManager.fire('pushStudentWork', compuEstimateAssessmentState);

	//push the state object into this or object's own copy of states
	this.states.push(compuEstimateAssessmentState);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/compuEstimateAssessment/compuEstimateAssessment.js');
}