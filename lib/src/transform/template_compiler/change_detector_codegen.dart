library angular2.src.transform.template_compiler.change_detector_codegen;

import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectorDefinition;
// Note: This class is only here so that we can reference it from TypeScript code.

// The actual implementation lives under modules_dart.

// TODO(tbosch): Move the corresponding code into angular2/src/compiler once

// the new compiler is done.
class Codegen {
  Codegen(String moduleAlias) {}
  void generate(String typeName, String changeDetectorTypeName,
      ChangeDetectorDefinition def) {
    throw "Not implemented in JS";
  }

  String toString() {
    throw "Not implemented in JS";
  }
}
