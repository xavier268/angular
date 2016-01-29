library angular2.src.platform.dom.debug.ng_probe;

import "package:angular2/src/facade/lang.dart"
    show assertionsEnabled, isPresent;
import "package:angular2/src/core/di.dart" show Injectable, provide, Provider;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/debug/debug_node.dart"
    show DebugNode, getDebugNode;
import "package:angular2/src/platform/dom/dom_renderer.dart"
    show DomRootRenderer;
import "package:angular2/core.dart" show RootRenderer;
import "package:angular2/src/core/debug/debug_renderer.dart"
    show DebugDomRootRenderer;

const INSPECT_GLOBAL_NAME = "ng.probe";
/**
 * Returns a [DebugElement] for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
DebugNode inspectNativeElement(element) {
  return getDebugNode(element);
}

_createConditionalRootRenderer(rootRenderer) {
  if (assertionsEnabled()) {
    return _createRootRenderer(rootRenderer);
  }
  return rootRenderer;
}

_createRootRenderer(rootRenderer) {
  DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  return new DebugDomRootRenderer(rootRenderer);
}

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
const List<dynamic> ELEMENT_PROBE_PROVIDERS = const [
  const Provider(RootRenderer,
      useFactory: _createConditionalRootRenderer, deps: const [DomRootRenderer])
];
const List<dynamic> ELEMENT_PROBE_PROVIDERS_PROD_MODE = const [
  const Provider(RootRenderer,
      useFactory: _createRootRenderer, deps: const [DomRootRenderer])
];
