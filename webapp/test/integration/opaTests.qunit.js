/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["AppFioriAluno99/appfiorialuno99/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
