/*
 * the scripts that are always necessary regardless of whether the
 * user is using the vle, authoring tool, or grading tool
 */
var coreScripts = [
	'vle/node/compuEstimateAssessment/CompuEstimateAssessmentNode.js',
	'vle/node/compuEstimateAssessment/compuEstimateAssessmentEvents.js'
];

//the scripts used in the vle
var studentVLEScripts = [
	'vle/node/compuEstimateAssessment/compuEstimateAssessment.js',
	'vle/node/compuEstimateAssessment/compuEstimateAssessmentState.js',
	'vle/jquery/js/jquery-1.6.1.min.js',
	'vle/jquery/js/jquery-ui-1.8.7.custom.min.js'
];

//the scripts used in the authoring tool
var authorScripts = [
	'vle/node/compuEstimateAssessment/authorview_compuEstimateAssessment.js'
];

//the scripts used in the grading tool
var gradingScripts = [
	'vle/node/compuEstimateAssessment/compuEstimateAssessmentState.js'
];

//dependencies when a file requires another file to be loaded before it
var dependencies = [
	{child:"vle/node/compuEstimateAssessment/CompuEstimateAssessmentNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'display', nodeClassText:'CompuEstimateAssessment'}
];

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);
scriptloader.addScriptToComponent('compuEstimateAssessment', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('CompuEstimateAssessmentNode', nodeClasses);

var css = [
       	"vle/node/compuEstimateAssessment/compuEstimateAssessment.css"
];

scriptloader.addCssToComponent('compuEstimateAssessment', css);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/compuEstimateAssessment/compuEstimateAssessmentTemplate.ea',
		nodeExtension:'ea'
	}
];

componentloader.addNodeTemplateParams('CompuEstimateAssessmentNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/compuEstimateAssessment/setup.js');
};