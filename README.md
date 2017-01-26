# FREME Workflow Editor

This repository is deprecated and not maintained any longer.

This project works as a demonstration of what the FREME services can do.
Its goal is to hide NIF from the user and show the capabilities of FREME.
Focus lies on simplicity, so that the user will not have to work his way around
begin/endIndices and annotations.

The service works by sending requests to the specified `fremeApi`, then parsing the
produced NIF (by using the [rdfQuery](https://code.google.com/archive/p/rdfquery/) library).
The annotations in the RDF graph are then grouped by their offsets and added as graphic tooltips to the input text.

## Installation

To install and deploy the Workflow Editor, start by cloning the git repository with 

`git clone https://github.com/freme-project/freme-workflow-editor.git`

Change into the new directory and open the file `js/freme-workflow.js` and change `fwm.fremeApi` attribute 
to the instance of FREME the Workflow editor should run against.

Start any HTTP-Server such as XAMPP or run

`python -m "SimpleHTTPServer" 8080`

You should be able to open the workflow editor in the browser at the url

`localhost:8080`

## Useful links

* [FREME project homepage](http://freme-project.eu)
* [Overview of FREME on GitHub](https://github.com/freme-project/technical-discussion/wiki/FREME-on-GitHub)
* [FREME technical discussion forum](https://github.com/freme-project/technical-discussion/issues)
* [FREME API documentation, current release](http://api.freme-project.eu/doc/current)
* [FREME API docuemntation, release candidate](http://api-dev.freme-project.eu/doc)

## License

Copyright 2015  Agro-Know, Deutsches Forschungszentrum für Künstliche Intelligenz, iMinds, 
Institut für Angewandte Informatik e. V. an der Universität Leipzig, 
Istituto Superiore Mario Boella, Tilde, Vistatec, WRIPL

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

This project uses 3rd party tools. You can find the list of 3rd party tools including their authors and licenses [here](LICENSE-3RD-PARTY).

