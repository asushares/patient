export class ExampleRequestPermit {
  public body = {
    "hook": "patient-consent-consult",
    "hookInstance": "patient-consent-consult",
    "context": {
      "actor": [
        {
          "value": "Organization/195247"
        }
      ],
      "purposeOfUse": [],
      "category": [],
      "patientId": [
        {
          "value": "Patient/195308"
        }
      ],
      "class": [],
      "content": {
        "resourceType": "Bundle",
        "id": "a7ec0781-01cf-46e1-9a58-a6e76fdca0d3",
        "total": 2,
        "entry": [
          {
            "resource": {
              "resourceType": "Observation",
              "id": "f204",
              "status": "final",
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "724713006",
                    "display": "Harmful use of ketamine (disorder)"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/195308"
              },
              "issued": "2013-04-04T14:34:00+01:00",
              "performer": [
                {
                  "reference": "Practitioner/f202",
                  "display": "Luigi Maas"
                }
              ],
              "valueBoolean": true
            }
          },
          {
            "resource": {
              "resourceType": "Medication",
              "id": "med0310",
              "contained": [
                {
                  "resourceType": "Substance",
                  "id": "sub03",
                  "instance": false,
                  "code": {
                    "concept": {
                      "coding": [
                        {
                          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                          "code": "480",
                          "display": "alfentanil"
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
}