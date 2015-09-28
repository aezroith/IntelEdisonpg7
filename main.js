var m = require('mraa');
var sql = require('mssql');
var config = {
	user: 'DB_9BDBD8_edison_admin',
	password: 'inteledison',
	server: 'SQL5002.Smarterasp.net',
	database: 'DB_9BDBD8_edison',
}
var DigitalPin_1 = new m.Gpio(2);
var DigitalPin_2 = new m.Gpio(3);
 
DigitalPin_1.dir(m.DIR_IN);
DigitalPin_2.dir(m.DIR_IN); 
 
var currentDigitalValue = 0;
var currentDuration = 0;
var timer = 0;
periodicActivity();
var connection = new sql.Connection(config, function(err) {
		var request = new sql.Request(connection);
		
		request.query("SELECT SETTING_VALUE FROM SETTINGS WHERE SETTING_NAME='SABOTAGETIMER'", function(err, recordset) {
            timer = recordset[0].SETTING_VALUE; 
		});
    });
function periodicActivity()
{
    if (currentDigitalValue == 1)
    {
        currentDuration += 1;
    }   
    var DigitalValue_1 = DigitalPin_1.read();
	var DigitalValue_2 = DigitalPin_2.read();
	
	if ((DigitalValue_1 == 1 || DigitalValue_2 == 1) && currentDigitalValue == 0)
	{
		currentDigitalValue = 1;
	}
	else if ((DigitalValue_1 == 0) && currentDigitalValue == 1)
	{
		if (currentDuration > timer)
		{    
			currentDigitalValue = 0;      
			insertRecord("S1", currentDuration); //Change the S1 to sensor ID here
			currentDuration = 0;
		}
	}
    setTimeout(periodicActivity, 1000);
}
	
function insertRecord(sensorId, duration){   
    
    var connection = new sql.Connection(config, function(err) {
        var request = new sql.Request(connection);
        request.input('PURPOSE', sql.VarChar, 'INSERT');
        request.input('SID', sql.VarChar, sensorId);
        request.input('DURATION', sql.Int, duration);
        request.execute('SP_tracklog', function(err, recordsets, returnValue) {
        });
     });
}