# Awadh Solar: Google Sheet enquiry setup (business Gmail)

यह setup **Awadh Solar के official business Gmail** में करें। Personal Gmail में बनाई हुई Sheet या Apps Script को production में इस्तेमाल न करें।

## 1. नई Google Sheet बनाएं

1. Business Gmail में sign in करें और [sheets.new](https://sheets.new) खोलें।
2. Spreadsheet का नाम रखें: `Awadh Solar - Customer Enquiries`।
3. नीचे वाली पहली row को `Enquiries` नाम के tab में रखें:

`Lead ID | Received at | Name | Phone | Requirement | Monthly bill | City / locality | Consent | Source`

Sheet का URL इसी format में रहेगा:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

यह URL बाद में Admin → Enquiries में **Google Sheet link** field में डालना है।

## 2. Apps Script खोलें

1. Sheet में **Extensions → Apps Script** खोलें।
2. Project का नाम रखें: `Awadh Solar Enquiry Webhook`।
3. `Code.gs` में पुराना code हटाकर नीचे वाला पूरा code paste करें।
4. Save करें।

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var data = JSON.parse(e.postData.contents || "{}");
    var token = PropertiesService.getScriptProperties().getProperty("ENQUIRY_TOKEN");

    if (!token || token.length < 24 || data.token !== token) {
      throw new Error("Unauthorized");
    }

    if (!data.consent || !/^[6-9][0-9]{9}$/.test(data.phone || "")) {
      throw new Error("Invalid input");
    }

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Enquiries") || spreadsheet.insertSheet("Enquiries");

    if (!sheet.getLastRow()) {
      sheet.appendRow([
        "Lead ID", "Received at", "Name", "Phone", "Requirement",
        "Monthly bill", "City / locality", "Consent", "Source"
      ]);
    }

    var receivedAt = Utilities.formatDate(
      new Date(),
      "Asia/Kolkata",
      "dd/MM/yyyy hh:mm:ss a"
    );

    // Prefix text with apostrophe so user input cannot become a Sheet formula.
    var safe = function (value) {
      return "'" + String(value || "").slice(0, 200);
    };

    sheet.appendRow([
      data.leadId || "",
      receivedAt,
      safe(data.name),
      safe(data.phone),
      safe(data.requirement),
      safe(data.billRange),
      safe(data.locality),
      "Yes",
      "Website popup"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "Awadh Solar Enquiry Webhook" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Private secret बनाएं

एक random secret बनाएं, कम से कम 32 characters का। इसे किसी public chat या screenshot में न भेजें। उदाहरण के लिए अपने password manager से random password बनाएं।

Apps Script में:

1. Left side **Project Settings** खोलें।
2. **Script Properties** में **Add script property** चुनें।
3. Property name: `ENQUIRY_TOKEN`
4. Property value: अपना random secret
5. Save करें।

यही exact secret बाद में website के Admin → Enquiries में डालना है।

## 4. Web app deploy करें

1. ऊपर **Deploy → New deployment** चुनें।
2. Type में **Web app** चुनें।
3. Description: `Awadh Solar Enquiry Webhook`
4. **Execute as:** `Me`
5. **Who has access:** `Anyone`
6. Deploy करें और Google permission screen पर अपने business Gmail से Allow करें।
7. मिलने वाला URL `/exec` पर खत्म होगा, जैसे:

`https://script.google.com/macros/s/DEPLOYMENT_ID/exec`

यही URL website में **Apps Script web app URL** field में डालना है।

## 5. Website Admin में connection save करें

1. Website खोलें: `/admin/login`
2. Admin dashboard में **Enquiries** खोलें।
3. ये fields भरें:

   - **Google Sheet link:** नई business Sheet का `/edit` URL
   - **Google Form link:** optional; केवल तब भरें जब अलग Google Form रखना हो
   - **Enable Google Sheets enquiries:** checked
   - **Apps Script web app URL:** deployment का `/exec` URL
   - **Shared secret:** वही `ENQUIRY_TOKEN`

4. **Save destination** दबाएं। Settings Cloudflare D1 में save होंगी।

## 6. Test

1. Public website पर enquiry popup खोलें।
2. सही नाम, 10-digit Indian mobile और consent देकर submit करें।
3. पहले record Cloudflare D1 के `leads` table में बनेगा।
4. Webhook सफल होने पर उसी समय Google Sheet के `Enquiries` tab में नई row आएगी।
5. D1 record में `sheetSynced: true` mark हो जाएगा।

अगर Sheet में row नहीं आती, तो Admin → Enquiries में endpoint और secret दोबारा मिलाएं। Website का D1 record फिर भी primary record रहेगा।

## महत्वपूर्ण सुरक्षा

- Setup केवल official business Gmail में करें।
- Secret को AnyDesk chat, public repository, screenshot या WhatsApp group में paste न करें।
- Sheet को public न करें; केवल business team को share करें।
- Google Form link और Google Sheet link reference के लिए हैं। Automatic website sync Apps Script `/exec` URL से होता है।
