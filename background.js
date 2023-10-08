var currentTab;
var version = "1.1";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	currentTab = tabId;

	chrome.debugger.attach(
		{
			//debug at current tab
			tabId: tabId,
		},
		version,
		onAttach.bind(null, tabId)
	);
});

function onAttach(tabId) {
	chrome.debugger.sendCommand(
		{
			//first enable the Network
			tabId: tabId,
		},
		"Network.enable"
	);

	chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
	if (currentTab != debuggeeId.tabId) {
		return;
	}
	if (message == "Network.loadingFinished") {
		chrome.debugger.sendCommand(
			{
				tabId: debuggeeId.tabId,
			},
			"Network.getResponseBody",
			{
				requestId: params.requestId,
			},
			function (response) {
				console.log(response);
				chrome.debugger.detach(debuggeeId);
			}
		);
	}
}
