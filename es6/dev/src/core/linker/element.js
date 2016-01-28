import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { Injector, Key, Dependency, Provider, NoProviderError } from 'angular2/src/core/di';
import { mergeResolvedProviders } from 'angular2/src/core/di/provider';
import { UNDEFINED, ProtoInjector, Visibility, InjectorInlineStrategy, ProviderWithVisibility } from 'angular2/src/core/di/injector';
import { resolveProvider, ResolvedFactory, ResolvedProvider_ } from 'angular2/src/core/di/provider';
import { AttributeMetadata, QueryMetadata } from '../metadata/di';
import { ViewType } from './view_type';
import { ElementRef_ } from './element_ref';
import { ViewContainerRef } from './view_container_ref';
import { ElementRef } from './element_ref';
import { Renderer } from 'angular2/src/core/render/api';
import { TemplateRef, TemplateRef_ } from './template_ref';
import { DirectiveMetadata, ComponentMetadata } from '../metadata/directives';
import { ChangeDetectorRef } from 'angular2/src/core/change_detection/change_detection';
import { QueryList } from './query_list';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { PipeProvider } from 'angular2/src/core/pipes/pipe_provider';
import { ViewContainerRef_ } from "./view_container_ref";
var _staticKeys;
export class StaticKeys {
    constructor() {
        this.templateRefId = Key.get(TemplateRef).id;
        this.viewContainerId = Key.get(ViewContainerRef).id;
        this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
        this.elementRefId = Key.get(ElementRef).id;
        this.rendererId = Key.get(Renderer).id;
    }
    static instance() {
        if (isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    }
}
export class DirectiveDependency extends Dependency {
    constructor(key, optional, lowerBoundVisibility, upperBoundVisibility, properties, attributeName, queryDecorator) {
        super(key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    /** @internal */
    _verify() {
        var count = 0;
        if (isPresent(this.queryDecorator))
            count++;
        if (isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    }
    static createFrom(d) {
        return new DirectiveDependency(d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    }
    /** @internal */
    static _attributeName(properties) {
        var p = properties.find(p => p instanceof AttributeMetadata);
        return isPresent(p) ? p.attributeName : null;
    }
    /** @internal */
    static _query(properties) {
        return properties.find(p => p instanceof QueryMetadata);
    }
}
export class DirectiveProvider extends ResolvedProvider_ {
    constructor(key, factory, deps, isComponent, providers, viewProviders, queries) {
        super(key, [new ResolvedFactory(factory, deps)], false);
        this.isComponent = isComponent;
        this.providers = providers;
        this.viewProviders = viewProviders;
        this.queries = queries;
    }
    get displayName() { return this.key.displayName; }
    static createFromType(type, meta) {
        var provider = new Provider(type, { useClass: type });
        if (isBlank(meta)) {
            meta = new DirectiveMetadata();
        }
        var rb = resolveProvider(provider);
        var rf = rb.resolvedFactories[0];
        var deps = rf.dependencies.map(DirectiveDependency.createFrom);
        var isComponent = meta instanceof ComponentMetadata;
        var resolvedProviders = isPresent(meta.providers) ? Injector.resolve(meta.providers) : null;
        var resolvedViewProviders = meta instanceof ComponentMetadata && isPresent(meta.viewProviders) ?
            Injector.resolve(meta.viewProviders) :
            null;
        var queries = [];
        if (isPresent(meta.queries)) {
            StringMapWrapper.forEach(meta.queries, (meta, fieldName) => {
                var setter = reflector.setter(fieldName);
                queries.push(new QueryMetadataWithSetter(setter, meta));
            });
        }
        // queries passed into the constructor.
        // TODO: remove this after constructor queries are no longer supported
        deps.forEach(d => {
            if (isPresent(d.queryDecorator)) {
                queries.push(new QueryMetadataWithSetter(null, d.queryDecorator));
            }
        });
        return new DirectiveProvider(rb.key, rf.factory, deps, isComponent, resolvedProviders, resolvedViewProviders, queries);
    }
}
export class QueryMetadataWithSetter {
    constructor(setter, metadata) {
        this.setter = setter;
        this.metadata = metadata;
    }
}
function setProvidersVisibility(providers, visibility, result) {
    for (var i = 0; i < providers.length; i++) {
        result.set(providers[i].key.id, visibility);
    }
}
export class AppProtoElement {
    constructor(firstProviderIsComponent, index, attributes, pwvs, protoQueryRefs, directiveVariableBindings) {
        this.firstProviderIsComponent = firstProviderIsComponent;
        this.index = index;
        this.attributes = attributes;
        this.protoQueryRefs = protoQueryRefs;
        this.directiveVariableBindings = directiveVariableBindings;
        var length = pwvs.length;
        if (length > 0) {
            this.protoInjector = new ProtoInjector(pwvs);
        }
        else {
            this.protoInjector = null;
            this.protoQueryRefs = [];
        }
    }
    static create(metadataCache, index, attributes, directiveTypes, directiveVariableBindings) {
        var componentDirProvider = null;
        var mergedProvidersMap = new Map();
        var providerVisibilityMap = new Map();
        var providers = ListWrapper.createGrowableSize(directiveTypes.length);
        var protoQueryRefs = [];
        for (var i = 0; i < directiveTypes.length; i++) {
            var dirProvider = metadataCache.getResolvedDirectiveMetadata(directiveTypes[i]);
            providers[i] = new ProviderWithVisibility(dirProvider, dirProvider.isComponent ? Visibility.PublicAndPrivate : Visibility.Public);
            if (dirProvider.isComponent) {
                componentDirProvider = dirProvider;
            }
            else {
                if (isPresent(dirProvider.providers)) {
                    mergeResolvedProviders(dirProvider.providers, mergedProvidersMap);
                    setProvidersVisibility(dirProvider.providers, Visibility.Public, providerVisibilityMap);
                }
            }
            if (isPresent(dirProvider.viewProviders)) {
                mergeResolvedProviders(dirProvider.viewProviders, mergedProvidersMap);
                setProvidersVisibility(dirProvider.viewProviders, Visibility.Private, providerVisibilityMap);
            }
            for (var queryIdx = 0; queryIdx < dirProvider.queries.length; queryIdx++) {
                var q = dirProvider.queries[queryIdx];
                protoQueryRefs.push(new ProtoQueryRef(i, q.setter, q.metadata));
            }
        }
        if (isPresent(componentDirProvider) && isPresent(componentDirProvider.providers)) {
            // directive providers need to be prioritized over component providers
            mergeResolvedProviders(componentDirProvider.providers, mergedProvidersMap);
            setProvidersVisibility(componentDirProvider.providers, Visibility.Public, providerVisibilityMap);
        }
        mergedProvidersMap.forEach((provider, _) => {
            providers.push(new ProviderWithVisibility(provider, providerVisibilityMap.get(provider.key.id)));
        });
        return new AppProtoElement(isPresent(componentDirProvider), index, attributes, providers, protoQueryRefs, directiveVariableBindings);
    }
    getProviderAtIndex(index) { return this.protoInjector.getProviderAtIndex(index); }
}
class _Context {
    constructor(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
}
export class InjectorWithHostBoundary {
    constructor(injector, hostInjectorBoundary) {
        this.injector = injector;
        this.hostInjectorBoundary = hostInjectorBoundary;
    }
}
export class AppElement {
    constructor(proto, parentView, parent, nativeElement, embeddedViewFactory) {
        this.proto = proto;
        this.parentView = parentView;
        this.parent = parent;
        this.nativeElement = nativeElement;
        this.embeddedViewFactory = embeddedViewFactory;
        this.nestedViews = null;
        this.componentView = null;
        this.ref = new ElementRef_(this);
        var parentInjector = isPresent(parent) ? parent._injector : parentView.parentInjector;
        if (isPresent(this.proto.protoInjector)) {
            var isBoundary;
            if (isPresent(parent) && isPresent(parent.proto.protoInjector)) {
                isBoundary = false;
            }
            else {
                isBoundary = parentView.hostInjectorBoundary;
            }
            this._queryStrategy = this._buildQueryStrategy();
            this._injector = new Injector(this.proto.protoInjector, parentInjector, isBoundary, this, () => this._debugContext());
            // we couple ourselves to the injector strategy to avoid polymorphic calls
            var injectorStrategy = this._injector.internalStrategy;
            this._strategy = injectorStrategy instanceof InjectorInlineStrategy ?
                new ElementDirectiveInlineStrategy(injectorStrategy, this) :
                new ElementDirectiveDynamicStrategy(injectorStrategy, this);
            this._strategy.init();
        }
        else {
            this._queryStrategy = null;
            this._injector = parentInjector;
            this._strategy = null;
        }
    }
    static getViewParentInjector(parentViewType, containerAppElement, imperativelyCreatedProviders, rootInjector) {
        var parentInjector;
        var hostInjectorBoundary;
        switch (parentViewType) {
            case ViewType.COMPONENT:
                parentInjector = containerAppElement._injector;
                hostInjectorBoundary = true;
                break;
            case ViewType.EMBEDDED:
                parentInjector = isPresent(containerAppElement.proto.protoInjector) ?
                    containerAppElement._injector.parent :
                    containerAppElement._injector;
                hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                break;
            case ViewType.HOST:
                if (isPresent(containerAppElement)) {
                    // host view is attached to a container
                    parentInjector = isPresent(containerAppElement.proto.protoInjector) ?
                        containerAppElement._injector.parent :
                        containerAppElement._injector;
                    if (isPresent(imperativelyCreatedProviders)) {
                        var imperativeProvidersWithVisibility = imperativelyCreatedProviders.map(p => new ProviderWithVisibility(p, Visibility.Public));
                        // The imperative injector is similar to having an element between
                        // the dynamic-loaded component and its parent => no boundary between
                        // the component and imperativelyCreatedInjector.
                        parentInjector = new Injector(new ProtoInjector(imperativeProvidersWithVisibility), parentInjector, true, null, null);
                        hostInjectorBoundary = false;
                    }
                    else {
                        hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                    }
                }
                else {
                    // bootstrap
                    parentInjector = rootInjector;
                    hostInjectorBoundary = true;
                }
                break;
        }
        return new InjectorWithHostBoundary(parentInjector, hostInjectorBoundary);
    }
    attachComponentView(componentView) { this.componentView = componentView; }
    _debugContext() {
        var c = this.parentView.getDebugContext(this, null, null);
        return isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    }
    hasVariableBinding(name) {
        var vb = this.proto.directiveVariableBindings;
        return isPresent(vb) && StringMapWrapper.contains(vb, name);
    }
    getVariableBinding(name) {
        var index = this.proto.directiveVariableBindings[name];
        return isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    }
    get(token) { return this._injector.get(token); }
    hasDirective(type) { return isPresent(this._injector.getOptional(type)); }
    getComponent() { return isPresent(this._strategy) ? this._strategy.getComponent() : null; }
    getInjector() { return this._injector; }
    getElementRef() { return this.ref; }
    getViewContainerRef() { return new ViewContainerRef_(this); }
    getTemplateRef() {
        if (isPresent(this.embeddedViewFactory)) {
            return new TemplateRef_(this.ref);
        }
        return null;
    }
    getDependency(injector, provider, dep) {
        if (provider instanceof DirectiveProvider) {
            var dirDep = dep;
            if (isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (isPresent(dirDep.queryDecorator))
                return this._queryStrategy.findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector.ref;
                }
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
                return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
                return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().templateRefId) {
                var tr = this.getTemplateRef();
                if (isBlank(tr) && !dirDep.optional) {
                    throw new NoProviderError(null, dirDep.key);
                }
                return tr;
            }
            if (dirDep.key.id === StaticKeys.instance().rendererId) {
                return this.parentView.renderer;
            }
        }
        else if (provider instanceof PipeProvider) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector;
                }
            }
        }
        return UNDEFINED;
    }
    _buildAttribute(dep) {
        var attributes = this.proto.attributes;
        if (isPresent(attributes) && StringMapWrapper.contains(attributes, dep.attributeName)) {
            return attributes[dep.attributeName];
        }
        else {
            return null;
        }
    }
    addDirectivesMatchingQuery(query, list) {
        var templateRef = this.getTemplateRef();
        if (query.selector === TemplateRef && isPresent(templateRef)) {
            list.push(templateRef);
        }
        if (this._strategy != null) {
            this._strategy.addDirectivesMatchingQuery(query, list);
        }
    }
    _buildQueryStrategy() {
        if (this.proto.protoQueryRefs.length === 0) {
            return _emptyQueryStrategy;
        }
        else if (this.proto.protoQueryRefs.length <=
            InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
            return new InlineQueryStrategy(this);
        }
        else {
            return new DynamicQueryStrategy(this);
        }
    }
    getDirectiveAtIndex(index) { return this._injector.getAt(index); }
    ngAfterViewChecked() {
        if (isPresent(this._queryStrategy))
            this._queryStrategy.updateViewQueries();
    }
    ngAfterContentChecked() {
        if (isPresent(this._queryStrategy))
            this._queryStrategy.updateContentQueries();
    }
    traverseAndSetQueriesAsDirty() {
        var inj = this;
        while (isPresent(inj)) {
            inj._setQueriesAsDirty();
            if (isBlank(inj.parent) && isPresent(inj.parentView.containerAppElement)) {
                inj = inj.parentView.containerAppElement;
            }
            else {
                inj = inj.parent;
            }
        }
    }
    _setQueriesAsDirty() {
        if (isPresent(this._queryStrategy)) {
            this._queryStrategy.setContentQueriesAsDirty();
        }
        if (this.parentView.proto.type === ViewType.COMPONENT) {
            this.parentView.containerAppElement._queryStrategy.setViewQueriesAsDirty();
        }
    }
}
class _EmptyQueryStrategy {
    setContentQueriesAsDirty() { }
    setViewQueriesAsDirty() { }
    updateContentQueries() { }
    updateViewQueries() { }
    findQuery(query) {
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
var _emptyQueryStrategy = new _EmptyQueryStrategy();
class InlineQueryStrategy {
    constructor(ei) {
        var protoRefs = ei.proto.protoQueryRefs;
        if (protoRefs.length > 0)
            this.query0 = new QueryRef(protoRefs[0], ei);
        if (protoRefs.length > 1)
            this.query1 = new QueryRef(protoRefs[1], ei);
        if (protoRefs.length > 2)
            this.query2 = new QueryRef(protoRefs[2], ei);
    }
    setContentQueriesAsDirty() {
        if (isPresent(this.query0) && !this.query0.isViewQuery)
            this.query0.dirty = true;
        if (isPresent(this.query1) && !this.query1.isViewQuery)
            this.query1.dirty = true;
        if (isPresent(this.query2) && !this.query2.isViewQuery)
            this.query2.dirty = true;
    }
    setViewQueriesAsDirty() {
        if (isPresent(this.query0) && this.query0.isViewQuery)
            this.query0.dirty = true;
        if (isPresent(this.query1) && this.query1.isViewQuery)
            this.query1.dirty = true;
        if (isPresent(this.query2) && this.query2.isViewQuery)
            this.query2.dirty = true;
    }
    updateContentQueries() {
        if (isPresent(this.query0) && !this.query0.isViewQuery) {
            this.query0.update();
        }
        if (isPresent(this.query1) && !this.query1.isViewQuery) {
            this.query1.update();
        }
        if (isPresent(this.query2) && !this.query2.isViewQuery) {
            this.query2.update();
        }
    }
    updateViewQueries() {
        if (isPresent(this.query0) && this.query0.isViewQuery) {
            this.query0.update();
        }
        if (isPresent(this.query1) && this.query1.isViewQuery) {
            this.query1.update();
        }
        if (isPresent(this.query2) && this.query2.isViewQuery) {
            this.query2.update();
        }
    }
    findQuery(query) {
        if (isPresent(this.query0) && this.query0.protoQueryRef.query === query) {
            return this.query0;
        }
        if (isPresent(this.query1) && this.query1.protoQueryRef.query === query) {
            return this.query1;
        }
        if (isPresent(this.query2) && this.query2.protoQueryRef.query === query) {
            return this.query2;
        }
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES = 3;
class DynamicQueryStrategy {
    constructor(ei) {
        this.queries = ei.proto.protoQueryRefs.map(p => new QueryRef(p, ei));
    }
    setContentQueriesAsDirty() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery)
                q.dirty = true;
        }
    }
    setViewQueriesAsDirty() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery)
                q.dirty = true;
        }
    }
    updateContentQueries() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery) {
                q.update();
            }
        }
    }
    updateViewQueries() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery) {
                q.update();
            }
        }
    }
    findQuery(query) {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.protoQueryRef.query === query) {
                return q;
            }
        }
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementDirectiveInlineStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    init() {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        i.resetConstructionCounter();
        if (p.provider0 instanceof DirectiveProvider && isPresent(p.keyId0) && i.obj0 === UNDEFINED)
            i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
        if (p.provider1 instanceof DirectiveProvider && isPresent(p.keyId1) && i.obj1 === UNDEFINED)
            i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
        if (p.provider2 instanceof DirectiveProvider && isPresent(p.keyId2) && i.obj2 === UNDEFINED)
            i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
        if (p.provider3 instanceof DirectiveProvider && isPresent(p.keyId3) && i.obj3 === UNDEFINED)
            i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
        if (p.provider4 instanceof DirectiveProvider && isPresent(p.keyId4) && i.obj4 === UNDEFINED)
            i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
        if (p.provider5 instanceof DirectiveProvider && isPresent(p.keyId5) && i.obj5 === UNDEFINED)
            i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
        if (p.provider6 instanceof DirectiveProvider && isPresent(p.keyId6) && i.obj6 === UNDEFINED)
            i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
        if (p.provider7 instanceof DirectiveProvider && isPresent(p.keyId7) && i.obj7 === UNDEFINED)
            i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
        if (p.provider8 instanceof DirectiveProvider && isPresent(p.keyId8) && i.obj8 === UNDEFINED)
            i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
        if (p.provider9 instanceof DirectiveProvider && isPresent(p.keyId9) && i.obj9 === UNDEFINED)
            i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
    }
    getComponent() { return this.injectorStrategy.obj0; }
    isComponentKey(key) {
        return this._ei.proto.firstProviderIsComponent && isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    }
    addDirectivesMatchingQuery(query, list) {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (isPresent(p.provider0) && p.provider0.key.token === query.selector) {
            if (i.obj0 === UNDEFINED)
                i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
            list.push(i.obj0);
        }
        if (isPresent(p.provider1) && p.provider1.key.token === query.selector) {
            if (i.obj1 === UNDEFINED)
                i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
            list.push(i.obj1);
        }
        if (isPresent(p.provider2) && p.provider2.key.token === query.selector) {
            if (i.obj2 === UNDEFINED)
                i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
            list.push(i.obj2);
        }
        if (isPresent(p.provider3) && p.provider3.key.token === query.selector) {
            if (i.obj3 === UNDEFINED)
                i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
            list.push(i.obj3);
        }
        if (isPresent(p.provider4) && p.provider4.key.token === query.selector) {
            if (i.obj4 === UNDEFINED)
                i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
            list.push(i.obj4);
        }
        if (isPresent(p.provider5) && p.provider5.key.token === query.selector) {
            if (i.obj5 === UNDEFINED)
                i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
            list.push(i.obj5);
        }
        if (isPresent(p.provider6) && p.provider6.key.token === query.selector) {
            if (i.obj6 === UNDEFINED)
                i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
            list.push(i.obj6);
        }
        if (isPresent(p.provider7) && p.provider7.key.token === query.selector) {
            if (i.obj7 === UNDEFINED)
                i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
            list.push(i.obj7);
        }
        if (isPresent(p.provider8) && p.provider8.key.token === query.selector) {
            if (i.obj8 === UNDEFINED)
                i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
            list.push(i.obj8);
        }
        if (isPresent(p.provider9) && p.provider9.key.token === query.selector) {
            if (i.obj9 === UNDEFINED)
                i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
            list.push(i.obj9);
        }
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
class ElementDirectiveDynamicStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    init() {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        inj.resetConstructionCounter();
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider && isPresent(p.keyIds[i]) &&
                inj.objs[i] === UNDEFINED) {
                inj.objs[i] = inj.instantiateProvider(p.providers[i], p.visibilities[i]);
            }
        }
    }
    getComponent() { return this.injectorStrategy.objs[0]; }
    isComponentKey(key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei.proto.firstProviderIsComponent && isPresent(key) && key.id === p.keyIds[0];
    }
    addDirectivesMatchingQuery(query, list) {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i].key.token === query.selector) {
                if (ist.objs[i] === UNDEFINED) {
                    ist.objs[i] = ist.instantiateProvider(p.providers[i], p.visibilities[i]);
                }
                list.push(ist.objs[i]);
            }
        }
    }
}
export class ProtoQueryRef {
    constructor(dirIndex, setter, query) {
        this.dirIndex = dirIndex;
        this.setter = setter;
        this.query = query;
    }
    get usesPropertySyntax() { return isPresent(this.setter); }
}
export class QueryRef {
    constructor(protoQueryRef, originator) {
        this.protoQueryRef = protoQueryRef;
        this.originator = originator;
        this.list = new QueryList();
        this.dirty = true;
    }
    get isViewQuery() { return this.protoQueryRef.query.isViewQuery; }
    update() {
        if (!this.dirty)
            return;
        this._update();
        this.dirty = false;
        // TODO delete the check once only field queries are supported
        if (this.protoQueryRef.usesPropertySyntax) {
            var dir = this.originator.getDirectiveAtIndex(this.protoQueryRef.dirIndex);
            if (this.protoQueryRef.query.first) {
                this.protoQueryRef.setter(dir, this.list.length > 0 ? this.list.first : null);
            }
            else {
                this.protoQueryRef.setter(dir, this.list);
            }
        }
        this.list.notifyOnChanges();
    }
    _update() {
        var aggregator = [];
        if (this.protoQueryRef.query.isViewQuery) {
            // intentionally skipping originator for view queries.
            var nestedView = this.originator.componentView;
            if (isPresent(nestedView))
                this._visitView(nestedView, aggregator);
        }
        else {
            this._visit(this.originator, aggregator);
        }
        this.list.reset(aggregator);
    }
    ;
    _visit(inj, aggregator) {
        var view = inj.parentView;
        var startIdx = inj.proto.index;
        for (var i = startIdx; i < view.appElements.length; i++) {
            var curInj = view.appElements[i];
            // The first injector after inj, that is outside the subtree rooted at
            // inj has to have a null parent or a parent that is an ancestor of inj.
            if (i > startIdx && (isBlank(curInj.parent) || curInj.parent.proto.index < startIdx)) {
                break;
            }
            if (!this.protoQueryRef.query.descendants &&
                !(curInj.parent == this.originator || curInj == this.originator))
                continue;
            // We visit the view container(VC) views right after the injector that contains
            // the VC. Theoretically, that might not be the right order if there are
            // child injectors of said injector. Not clear whether if such case can
            // even be constructed with the current apis.
            this._visitInjector(curInj, aggregator);
            this._visitViewContainerViews(curInj.nestedViews, aggregator);
        }
    }
    _visitInjector(inj, aggregator) {
        if (this.protoQueryRef.query.isVarBindingQuery) {
            this._aggregateVariableBinding(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
    }
    _visitViewContainerViews(views, aggregator) {
        if (isPresent(views)) {
            for (var j = 0; j < views.length; j++) {
                this._visitView(views[j], aggregator);
            }
        }
    }
    _visitView(view, aggregator) {
        for (var i = 0; i < view.appElements.length; i++) {
            var inj = view.appElements[i];
            this._visitInjector(inj, aggregator);
            this._visitViewContainerViews(inj.nestedViews, aggregator);
        }
    }
    _aggregateVariableBinding(inj, aggregator) {
        var vb = this.protoQueryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    }
    _aggregateDirective(inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
    }
}
class _ComponentViewChangeDetectorRef extends ChangeDetectorRef {
    constructor(_appElement) {
        super();
        this._appElement = _appElement;
    }
    markForCheck() { this._appElement.componentView.changeDetector.ref.markForCheck(); }
    detach() { this._appElement.componentView.changeDetector.ref.detach(); }
    detectChanges() { this._appElement.componentView.changeDetector.ref.detectChanges(); }
    checkNoChanges() { this._appElement.componentView.changeDetector.ref.checkNoChanges(); }
    reattach() { this._appElement.componentView.changeDetector.ref.reattach(); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIuY3JlYXRlRnJvbVR5cGUiLCJRdWVyeU1ldGFkYXRhV2l0aFNldHRlciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyLmNvbnN0cnVjdG9yIiwic2V0UHJvdmlkZXJzVmlzaWJpbGl0eSIsIkFwcFByb3RvRWxlbWVudCIsIkFwcFByb3RvRWxlbWVudC5jb25zdHJ1Y3RvciIsIkFwcFByb3RvRWxlbWVudC5jcmVhdGUiLCJBcHBQcm90b0VsZW1lbnQuZ2V0UHJvdmlkZXJBdEluZGV4IiwiX0NvbnRleHQiLCJfQ29udGV4dC5jb25zdHJ1Y3RvciIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeS5jb25zdHJ1Y3RvciIsIkFwcEVsZW1lbnQiLCJBcHBFbGVtZW50LmNvbnN0cnVjdG9yIiwiQXBwRWxlbWVudC5nZXRWaWV3UGFyZW50SW5qZWN0b3IiLCJBcHBFbGVtZW50LmF0dGFjaENvbXBvbmVudFZpZXciLCJBcHBFbGVtZW50Ll9kZWJ1Z0NvbnRleHQiLCJBcHBFbGVtZW50Lmhhc1ZhcmlhYmxlQmluZGluZyIsIkFwcEVsZW1lbnQuZ2V0VmFyaWFibGVCaW5kaW5nIiwiQXBwRWxlbWVudC5nZXQiLCJBcHBFbGVtZW50Lmhhc0RpcmVjdGl2ZSIsIkFwcEVsZW1lbnQuZ2V0Q29tcG9uZW50IiwiQXBwRWxlbWVudC5nZXRJbmplY3RvciIsIkFwcEVsZW1lbnQuZ2V0RWxlbWVudFJlZiIsIkFwcEVsZW1lbnQuZ2V0Vmlld0NvbnRhaW5lclJlZiIsIkFwcEVsZW1lbnQuZ2V0VGVtcGxhdGVSZWYiLCJBcHBFbGVtZW50LmdldERlcGVuZGVuY3kiLCJBcHBFbGVtZW50Ll9idWlsZEF0dHJpYnV0ZSIsIkFwcEVsZW1lbnQuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJBcHBFbGVtZW50Ll9idWlsZFF1ZXJ5U3RyYXRlZ3kiLCJBcHBFbGVtZW50LmdldERpcmVjdGl2ZUF0SW5kZXgiLCJBcHBFbGVtZW50Lm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkFwcEVsZW1lbnQubmdBZnRlckNvbnRlbnRDaGVja2VkIiwiQXBwRWxlbWVudC50cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5IiwiQXBwRWxlbWVudC5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuaW5pdCIsIkVsZW1lbnREaXJlY3RpdmVJbmxpbmVTdHJhdGVneS5nZXRDb21wb25lbnQiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5IiwiRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuaW5pdCIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneS5pc0NvbXBvbmVudEtleSIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJQcm90b1F1ZXJ5UmVmIiwiUHJvdG9RdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlByb3RvUXVlcnlSZWYudXNlc1Byb3BlcnR5U3ludGF4IiwiUXVlcnlSZWYiLCJRdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlF1ZXJ5UmVmLmlzVmlld1F1ZXJ5IiwiUXVlcnlSZWYudXBkYXRlIiwiUXVlcnlSZWYuX3VwZGF0ZSIsIlF1ZXJ5UmVmLl92aXNpdCIsIlF1ZXJ5UmVmLl92aXNpdEluamVjdG9yIiwiUXVlcnlSZWYuX3Zpc2l0Vmlld0NvbnRhaW5lclZpZXdzIiwiUXVlcnlSZWYuX3Zpc2l0VmlldyIsIlF1ZXJ5UmVmLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmciLCJRdWVyeVJlZi5fYWdncmVnYXRlRGlyZWN0aXZlIiwiX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZiIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuY29uc3RydWN0b3IiLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjayIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuZGV0YWNoIiwiX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzIiwiX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZi5jaGVja05vQ2hhbmdlcyIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYucmVhdHRhY2giXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFLUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFDLFdBQVcsRUFBYyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUNqRixFQUNMLFFBQVEsRUFDUixHQUFHLEVBQ0gsVUFBVSxFQUVWLFFBQVEsRUFFUixlQUFlLEVB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TUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7WUFDOUJBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxFQUFFQSxDQUFDQTtZQUNwQ0EsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxJQUFJQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQTtnQkFDL0JBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUNwQ0EsTUFBTUEsSUFBSUEsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlDQSxDQUFDQTtnQkFDREEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDWkEsQ0FBQ0E7WUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUNsQ0EsQ0FBQ0E7UUFFSEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsWUFBWUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFD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QUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDekVBLENBQUNBO0lBRURELHdCQUF3QkE7UUFDdEJFLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBRURGLHFCQUFxQkE7UUFDbkJHLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbEZBLENBQUNBO0lBRURILG9CQUFvQkE7UUFDbEJJLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURKLGlCQUFpQkE7UUFDZkssRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREwsU0FBU0EsQ0FBQ0EsS0FBb0JBO1FBQzVCTSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEtB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QUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERixZQUFZQSxLQUFVRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTFESCxjQUFjQSxDQUFDQSxHQUFRQTtRQUNyQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esd0JBQXdCQSxJQUFJQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQTtZQUN6REEsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUMvREEsQ0FBQ0E7SUFFREosMEJBQTBCQSxDQUFDQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURLLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Es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OENBQThDLGlCQUFpQjtJQUM3RFcsWUFBb0JBLFdBQXVCQTtRQUFJQyxPQUFPQSxDQUFDQTtRQUFuQ0EsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO0lBQWFBLENBQUNBO0lBRXpERCxZQUFZQSxLQUFXRSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxhQUFhQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMxRkYsTUFBTUEsS0FBV0csSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUVILGFBQWFBLEtBQVdJLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQzVGSixjQUFjQSxLQUFXSyxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxhQUFhQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5RkwsUUFBUUEsS0FBV00sSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDcEZOLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIHN0cmluZ2lmeSxcbiAgQ09OU1RfRVhQUixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIEluamVjdG9yLFxuICBLZXksXG4gIERlcGVuZGVuY3ksXG4gIHByb3ZpZGUsXG4gIFByb3ZpZGVyLFxuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBOb1Byb3ZpZGVyRXJyb3IsXG4gIEFic3RyYWN0UHJvdmlkZXJFcnJvcixcbiAgQ3ljbGljRGVwZW5kZW5jeUVycm9yLFxuICByZXNvbHZlRm9yd2FyZFJlZixcbiAgSW5qZWN0YWJsZVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge21lcmdlUmVzb2x2ZWRQcm92aWRlcnN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIFVOREVGSU5FRCxcbiAgUHJvdG9JbmplY3RvcixcbiAgVmlzaWJpbGl0eSxcbiAgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSxcbiAgSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksXG4gIFByb3ZpZGVyV2l0aFZpc2liaWxpdHksXG4gIERlcGVuZGVuY3lQcm92aWRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5pbXBvcnQge3Jlc29sdmVQcm92aWRlciwgUmVzb2x2ZWRGYWN0b3J5LCBSZXNvbHZlZFByb3ZpZGVyX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuXG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhLCBRdWVyeU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaSc7XG5cbmltcG9ydCB7QXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcbmltcG9ydCB7RWxlbWVudFJlZl99IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4vdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge1JlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7VGVtcGxhdGVSZWYsIFRlbXBsYXRlUmVmX30gZnJvbSAnLi90ZW1wbGF0ZV9yZWYnO1xuaW1wb3J0IHtEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcG9uZW50TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3IsXG4gIENoYW5nZURldGVjdG9yUmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1F1ZXJ5TGlzdH0gZnJvbSAnLi9xdWVyeV9saXN0JztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtTZXR0ZXJGbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi90eXBlcyc7XG5pbXBvcnQge0FmdGVyVmlld0NoZWNrZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbnRlcmZhY2VzJztcbmltcG9ydCB7UGlwZVByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9waXBlcy9waXBlX3Byb3ZpZGVyJztcblxuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmX30gZnJvbSBcIi4vdmlld19jb250YWluZXJfcmVmXCI7XG5pbXBvcnQge1Jlc29sdmVkTWV0YWRhdGFDYWNoZX0gZnJvbSAnLi9yZXNvbHZlZF9tZXRhZGF0YV9jYWNoZSc7XG5cbnZhciBfc3RhdGljS2V5cztcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0tleXMge1xuICB0ZW1wbGF0ZVJlZklkOiBudW1iZXI7XG4gIHZpZXdDb250YWluZXJJZDogbnVtYmVyO1xuICBjaGFuZ2VEZXRlY3RvclJlZklkOiBudW1iZXI7XG4gIGVsZW1lbnRSZWZJZDogbnVtYmVyO1xuICByZW5kZXJlcklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy50ZW1wbGF0ZVJlZklkID0gS2V5LmdldChUZW1wbGF0ZVJlZikuaWQ7XG4gICAgdGhpcy52aWV3Q29udGFpbmVySWQgPSBLZXkuZ2V0KFZpZXdDb250YWluZXJSZWYpLmlkO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWZJZCA9IEtleS5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpLmlkO1xuICAgIHRoaXMuZWxlbWVudFJlZklkID0gS2V5LmdldChFbGVtZW50UmVmKS5pZDtcbiAgICB0aGlzLnJlbmRlcmVySWQgPSBLZXkuZ2V0KFJlbmRlcmVyKS5pZDtcbiAgfVxuXG4gIHN0YXRpYyBpbnN0YW5jZSgpOiBTdGF0aWNLZXlzIHtcbiAgICBpZiAoaXNCbGFuayhfc3RhdGljS2V5cykpIF9zdGF0aWNLZXlzID0gbmV3IFN0YXRpY0tleXMoKTtcbiAgICByZXR1cm4gX3N0YXRpY0tleXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZURlcGVuZGVuY3kgZXh0ZW5kcyBEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3Ioa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LFxuICAgICAgICAgICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LCBwcm9wZXJ0aWVzOiBhbnlbXSwgcHVibGljIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIHF1ZXJ5RGVjb3JhdG9yOiBRdWVyeU1ldGFkYXRhKSB7XG4gICAgc3VwZXIoa2V5LCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LCBwcm9wZXJ0aWVzKTtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZlcmlmeSgpOiB2b2lkIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeURlY29yYXRvcikpIGNvdW50Kys7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmF0dHJpYnV0ZU5hbWUpKSBjb3VudCsrO1xuICAgIGlmIChjb3VudCA+IDEpXG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAnQSBkaXJlY3RpdmUgaW5qZWN0YWJsZSBjYW4gY29udGFpbiBvbmx5IG9uZSBvZiB0aGUgZm9sbG93aW5nIEBBdHRyaWJ1dGUgb3IgQFF1ZXJ5LicpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb20oZDogRGVwZW5kZW5jeSk6IERpcmVjdGl2ZURlcGVuZGVuY3kge1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlRGVwZW5kZW5jeShcbiAgICAgICAgZC5rZXksIGQub3B0aW9uYWwsIGQubG93ZXJCb3VuZFZpc2liaWxpdHksIGQudXBwZXJCb3VuZFZpc2liaWxpdHksIGQucHJvcGVydGllcyxcbiAgICAgICAgRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZShkLnByb3BlcnRpZXMpLCBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9xdWVyeShkLnByb3BlcnRpZXMpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9hdHRyaWJ1dGVOYW1lKHByb3BlcnRpZXM6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgcCA9IDxBdHRyaWJ1dGVNZXRhZGF0YT5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgIHJldHVybiBpc1ByZXNlbnQocCkgPyBwLmF0dHJpYnV0ZU5hbWUgOiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3F1ZXJ5KHByb3BlcnRpZXM6IGFueVtdKTogUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIDxRdWVyeU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBRdWVyeU1ldGFkYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUHJvdmlkZXIgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyXyB7XG4gIGNvbnN0cnVjdG9yKGtleTogS2V5LCBmYWN0b3J5OiBGdW5jdGlvbiwgZGVwczogRGVwZW5kZW5jeVtdLCBwdWJsaWMgaXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSwgcHVibGljIHZpZXdQcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgcHVibGljIHF1ZXJpZXM6IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyW10pIHtcbiAgICBzdXBlcihrZXksIFtuZXcgUmVzb2x2ZWRGYWN0b3J5KGZhY3RvcnksIGRlcHMpXSwgZmFsc2UpO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmtleS5kaXNwbGF5TmFtZTsgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tVHlwZSh0eXBlOiBUeXBlLCBtZXRhOiBEaXJlY3RpdmVNZXRhZGF0YSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICB2YXIgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIodHlwZSwge3VzZUNsYXNzOiB0eXBlfSk7XG4gICAgaWYgKGlzQmxhbmsobWV0YSkpIHtcbiAgICAgIG1ldGEgPSBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoKTtcbiAgICB9XG4gICAgdmFyIHJiID0gcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB2YXIgcmYgPSByYi5yZXNvbHZlZEZhY3Rvcmllc1swXTtcbiAgICB2YXIgZGVwczogRGlyZWN0aXZlRGVwZW5kZW5jeVtdID0gcmYuZGVwZW5kZW5jaWVzLm1hcChEaXJlY3RpdmVEZXBlbmRlbmN5LmNyZWF0ZUZyb20pO1xuICAgIHZhciBpc0NvbXBvbmVudCA9IG1ldGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YTtcbiAgICB2YXIgcmVzb2x2ZWRQcm92aWRlcnMgPSBpc1ByZXNlbnQobWV0YS5wcm92aWRlcnMpID8gSW5qZWN0b3IucmVzb2x2ZShtZXRhLnByb3ZpZGVycykgOiBudWxsO1xuICAgIHZhciByZXNvbHZlZFZpZXdQcm92aWRlcnMgPSBtZXRhIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEgJiYgaXNQcmVzZW50KG1ldGEudmlld1Byb3ZpZGVycykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5qZWN0b3IucmVzb2x2ZShtZXRhLnZpZXdQcm92aWRlcnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XG4gICAgdmFyIHF1ZXJpZXMgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KG1ldGEucXVlcmllcykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChtZXRhLnF1ZXJpZXMsIChtZXRhLCBmaWVsZE5hbWUpID0+IHtcbiAgICAgICAgdmFyIHNldHRlciA9IHJlZmxlY3Rvci5zZXR0ZXIoZmllbGROYW1lKTtcbiAgICAgICAgcXVlcmllcy5wdXNoKG5ldyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcihzZXR0ZXIsIG1ldGEpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBxdWVyaWVzIHBhc3NlZCBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyBhZnRlciBjb25zdHJ1Y3RvciBxdWVyaWVzIGFyZSBubyBsb25nZXIgc3VwcG9ydGVkXG4gICAgZGVwcy5mb3JFYWNoKGQgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChkLnF1ZXJ5RGVjb3JhdG9yKSkge1xuICAgICAgICBxdWVyaWVzLnB1c2gobmV3IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyKG51bGwsIGQucXVlcnlEZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZVByb3ZpZGVyKHJiLmtleSwgcmYuZmFjdG9yeSwgZGVwcywgaXNDb21wb25lbnQsIHJlc29sdmVkUHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzLCBxdWVyaWVzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2V0dGVyOiBTZXR0ZXJGbiwgcHVibGljIG1ldGFkYXRhOiBRdWVyeU1ldGFkYXRhKSB7fVxufVxuXG5cbmZ1bmN0aW9uIHNldFByb3ZpZGVyc1Zpc2liaWxpdHkocHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10sIHZpc2liaWxpdHk6IFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogTWFwPG51bWJlciwgVmlzaWJpbGl0eT4pIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHQuc2V0KHByb3ZpZGVyc1tpXS5rZXkuaWQsIHZpc2liaWxpdHkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBcHBQcm90b0VsZW1lbnQge1xuICBwcm90b0luamVjdG9yOiBQcm90b0luamVjdG9yO1xuXG4gIHN0YXRpYyBjcmVhdGUobWV0YWRhdGFDYWNoZTogUmVzb2x2ZWRNZXRhZGF0YUNhY2hlLCBpbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBkaXJlY3RpdmVUeXBlczogVHlwZVtdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M6IHtba2V5OiBzdHJpbmddOiBudW1iZXJ9KTogQXBwUHJvdG9FbGVtZW50IHtcbiAgICB2YXIgY29tcG9uZW50RGlyUHJvdmlkZXIgPSBudWxsO1xuICAgIHZhciBtZXJnZWRQcm92aWRlcnNNYXA6IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+ID0gbmV3IE1hcDxudW1iZXIsIFJlc29sdmVkUHJvdmlkZXI+KCk7XG4gICAgdmFyIHByb3ZpZGVyVmlzaWJpbGl0eU1hcDogTWFwPG51bWJlciwgVmlzaWJpbGl0eT4gPSBuZXcgTWFwPG51bWJlciwgVmlzaWJpbGl0eT4oKTtcbiAgICB2YXIgcHJvdmlkZXJzID0gTGlzdFdyYXBwZXIuY3JlYXRlR3Jvd2FibGVTaXplKGRpcmVjdGl2ZVR5cGVzLmxlbmd0aCk7XG5cbiAgICB2YXIgcHJvdG9RdWVyeVJlZnMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpcmVjdGl2ZVR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGlyUHJvdmlkZXIgPSBtZXRhZGF0YUNhY2hlLmdldFJlc29sdmVkRGlyZWN0aXZlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZXNbaV0pO1xuICAgICAgcHJvdmlkZXJzW2ldID0gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoXG4gICAgICAgICAgZGlyUHJvdmlkZXIsIGRpclByb3ZpZGVyLmlzQ29tcG9uZW50ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWMpO1xuXG4gICAgICBpZiAoZGlyUHJvdmlkZXIuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50RGlyUHJvdmlkZXIgPSBkaXJQcm92aWRlcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZGlyUHJvdmlkZXIucHJvdmlkZXJzKSkge1xuICAgICAgICAgIG1lcmdlUmVzb2x2ZWRQcm92aWRlcnMoZGlyUHJvdmlkZXIucHJvdmlkZXJzLCBtZXJnZWRQcm92aWRlcnNNYXApO1xuICAgICAgICAgIHNldFByb3ZpZGVyc1Zpc2liaWxpdHkoZGlyUHJvdmlkZXIucHJvdmlkZXJzLCBWaXNpYmlsaXR5LlB1YmxpYywgcHJvdmlkZXJWaXNpYmlsaXR5TWFwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChkaXJQcm92aWRlci52aWV3UHJvdmlkZXJzKSkge1xuICAgICAgICBtZXJnZVJlc29sdmVkUHJvdmlkZXJzKGRpclByb3ZpZGVyLnZpZXdQcm92aWRlcnMsIG1lcmdlZFByb3ZpZGVyc01hcCk7XG4gICAgICAgIHNldFByb3ZpZGVyc1Zpc2liaWxpdHkoZGlyUHJvdmlkZXIudmlld1Byb3ZpZGVycywgVmlzaWJpbGl0eS5Qcml2YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmlzaWJpbGl0eU1hcCk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBxdWVyeUlkeCA9IDA7IHF1ZXJ5SWR4IDwgZGlyUHJvdmlkZXIucXVlcmllcy5sZW5ndGg7IHF1ZXJ5SWR4KyspIHtcbiAgICAgICAgdmFyIHEgPSBkaXJQcm92aWRlci5xdWVyaWVzW3F1ZXJ5SWR4XTtcbiAgICAgICAgcHJvdG9RdWVyeVJlZnMucHVzaChuZXcgUHJvdG9RdWVyeVJlZihpLCBxLnNldHRlciwgcS5tZXRhZGF0YSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudERpclByb3ZpZGVyKSAmJiBpc1ByZXNlbnQoY29tcG9uZW50RGlyUHJvdmlkZXIucHJvdmlkZXJzKSkge1xuICAgICAgLy8gZGlyZWN0aXZlIHByb3ZpZGVycyBuZWVkIHRvIGJlIHByaW9yaXRpemVkIG92ZXIgY29tcG9uZW50IHByb3ZpZGVyc1xuICAgICAgbWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhjb21wb25lbnREaXJQcm92aWRlci5wcm92aWRlcnMsIG1lcmdlZFByb3ZpZGVyc01hcCk7XG4gICAgICBzZXRQcm92aWRlcnNWaXNpYmlsaXR5KGNvbXBvbmVudERpclByb3ZpZGVyLnByb3ZpZGVycywgVmlzaWJpbGl0eS5QdWJsaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyVmlzaWJpbGl0eU1hcCk7XG4gICAgfVxuICAgIG1lcmdlZFByb3ZpZGVyc01hcC5mb3JFYWNoKChwcm92aWRlciwgXykgPT4ge1xuICAgICAgcHJvdmlkZXJzLnB1c2goXG4gICAgICAgICAgbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkocHJvdmlkZXIsIHByb3ZpZGVyVmlzaWJpbGl0eU1hcC5nZXQocHJvdmlkZXIua2V5LmlkKSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBBcHBQcm90b0VsZW1lbnQoaXNQcmVzZW50KGNvbXBvbmVudERpclByb3ZpZGVyKSwgaW5kZXgsIGF0dHJpYnV0ZXMsIHByb3ZpZGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm90b1F1ZXJ5UmVmcywgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLCBwdWJsaWMgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGF0dHJpYnV0ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LCBwd3ZzOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm90b1F1ZXJ5UmVmczogUHJvdG9RdWVyeVJlZltdLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nczoge1trZXk6IHN0cmluZ106IG51bWJlcn0pIHtcbiAgICB2YXIgbGVuZ3RoID0gcHd2cy5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucHJvdG9JbmplY3RvciA9IG5ldyBQcm90b0luamVjdG9yKHB3dnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3RvSW5qZWN0b3IgPSBudWxsO1xuICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmcyA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMucHJvdG9JbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgoaW5kZXgpOyB9XG59XG5cbmNsYXNzIF9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGNvbXBvbmVudEVsZW1lbnQ6IGFueSwgcHVibGljIGluamVjdG9yOiBhbnkpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBJbmplY3RvcldpdGhIb3N0Qm91bmRhcnkge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgaG9zdEluamVjdG9yQm91bmRhcnk6IGJvb2xlYW4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBBcHBFbGVtZW50IGltcGxlbWVudHMgRGVwZW5kZW5jeVByb3ZpZGVyLCBFbGVtZW50UmVmLCBBZnRlclZpZXdDaGVja2VkIHtcbiAgc3RhdGljIGdldFZpZXdQYXJlbnRJbmplY3RvcihwYXJlbnRWaWV3VHlwZTogVmlld1R5cGUsIGNvbnRhaW5lckFwcEVsZW1lbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1wZXJhdGl2ZWx5Q3JlYXRlZFByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RJbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvcldpdGhIb3N0Qm91bmRhcnkge1xuICAgIHZhciBwYXJlbnRJbmplY3RvcjtcbiAgICB2YXIgaG9zdEluamVjdG9yQm91bmRhcnk7XG4gICAgc3dpdGNoIChwYXJlbnRWaWV3VHlwZSkge1xuICAgICAgY2FzZSBWaWV3VHlwZS5DT01QT05FTlQ6XG4gICAgICAgIHBhcmVudEluamVjdG9yID0gY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3I7XG4gICAgICAgIGhvc3RJbmplY3RvckJvdW5kYXJ5ID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFZpZXdUeXBlLkVNQkVEREVEOlxuICAgICAgICBwYXJlbnRJbmplY3RvciA9IGlzUHJlc2VudChjb250YWluZXJBcHBFbGVtZW50LnByb3RvLnByb3RvSW5qZWN0b3IpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IucGFyZW50IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3I7XG4gICAgICAgIGhvc3RJbmplY3RvckJvdW5kYXJ5ID0gY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IuaG9zdEJvdW5kYXJ5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuSE9TVDpcbiAgICAgICAgaWYgKGlzUHJlc2VudChjb250YWluZXJBcHBFbGVtZW50KSkge1xuICAgICAgICAgIC8vIGhvc3QgdmlldyBpcyBhdHRhY2hlZCB0byBhIGNvbnRhaW5lclxuICAgICAgICAgIHBhcmVudEluamVjdG9yID0gaXNQcmVzZW50KGNvbnRhaW5lckFwcEVsZW1lbnQucHJvdG8ucHJvdG9JbmplY3RvcikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lckFwcEVsZW1lbnQuX2luamVjdG9yLnBhcmVudCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3I7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkUHJvdmlkZXJzKSkge1xuICAgICAgICAgICAgdmFyIGltcGVyYXRpdmVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSA9IGltcGVyYXRpdmVseUNyZWF0ZWRQcm92aWRlcnMubWFwKFxuICAgICAgICAgICAgICAgIHAgPT4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkocCwgVmlzaWJpbGl0eS5QdWJsaWMpKTtcbiAgICAgICAgICAgIC8vIFRoZSBpbXBlcmF0aXZlIGluamVjdG9yIGlzIHNpbWlsYXIgdG8gaGF2aW5nIGFuIGVsZW1lbnQgYmV0d2VlblxuICAgICAgICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyeSBiZXR3ZWVuXG4gICAgICAgICAgICAvLyB0aGUgY29tcG9uZW50IGFuZCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IuXG4gICAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IG5ldyBJbmplY3RvcihuZXcgUHJvdG9JbmplY3RvcihpbXBlcmF0aXZlUHJvdmlkZXJzV2l0aFZpc2liaWxpdHkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SW5qZWN0b3IsIHRydWUsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3Rvci5ob3N0Qm91bmRhcnk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJvb3RzdHJhcFxuICAgICAgICAgIHBhcmVudEluamVjdG9yID0gcm9vdEluamVjdG9yO1xuICAgICAgICAgIGhvc3RJbmplY3RvckJvdW5kYXJ5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBJbmplY3RvcldpdGhIb3N0Qm91bmRhcnkocGFyZW50SW5qZWN0b3IsIGhvc3RJbmplY3RvckJvdW5kYXJ5KTtcbiAgfVxuXG4gIHB1YmxpYyBuZXN0ZWRWaWV3czogQXBwVmlld1tdID0gbnVsbDtcbiAgcHVibGljIGNvbXBvbmVudFZpZXc6IEFwcFZpZXcgPSBudWxsO1xuXG4gIHByaXZhdGUgX3F1ZXJ5U3RyYXRlZ3k6IF9RdWVyeVN0cmF0ZWd5O1xuICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3I7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBfRWxlbWVudERpcmVjdGl2ZVN0cmF0ZWd5O1xuICBwdWJsaWMgcmVmOiBFbGVtZW50UmVmXztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG86IEFwcFByb3RvRWxlbWVudCwgcHVibGljIHBhcmVudFZpZXc6IEFwcFZpZXcsIHB1YmxpYyBwYXJlbnQ6IEFwcEVsZW1lbnQsXG4gICAgICAgICAgICAgIHB1YmxpYyBuYXRpdmVFbGVtZW50OiBhbnksIHB1YmxpYyBlbWJlZGRlZFZpZXdGYWN0b3J5OiBGdW5jdGlvbikge1xuICAgIHRoaXMucmVmID0gbmV3IEVsZW1lbnRSZWZfKHRoaXMpO1xuICAgIHZhciBwYXJlbnRJbmplY3RvciA9IGlzUHJlc2VudChwYXJlbnQpID8gcGFyZW50Ll9pbmplY3RvciA6IHBhcmVudFZpZXcucGFyZW50SW5qZWN0b3I7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnByb3RvLnByb3RvSW5qZWN0b3IpKSB7XG4gICAgICB2YXIgaXNCb3VuZGFyeTtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSAmJiBpc1ByZXNlbnQocGFyZW50LnByb3RvLnByb3RvSW5qZWN0b3IpKSB7XG4gICAgICAgIGlzQm91bmRhcnkgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzQm91bmRhcnkgPSBwYXJlbnRWaWV3Lmhvc3RJbmplY3RvckJvdW5kYXJ5O1xuICAgICAgfVxuICAgICAgdGhpcy5fcXVlcnlTdHJhdGVneSA9IHRoaXMuX2J1aWxkUXVlcnlTdHJhdGVneSgpO1xuICAgICAgdGhpcy5faW5qZWN0b3IgPSBuZXcgSW5qZWN0b3IodGhpcy5wcm90by5wcm90b0luamVjdG9yLCBwYXJlbnRJbmplY3RvciwgaXNCb3VuZGFyeSwgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpID0+IHRoaXMuX2RlYnVnQ29udGV4dCgpKTtcblxuICAgICAgLy8gd2UgY291cGxlIG91cnNlbHZlcyB0byB0aGUgaW5qZWN0b3Igc3RyYXRlZ3kgdG8gYXZvaWQgcG9seW1vcnBoaWMgY2FsbHNcbiAgICAgIHZhciBpbmplY3RvclN0cmF0ZWd5ID0gPGFueT50aGlzLl9pbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5O1xuICAgICAgdGhpcy5fc3RyYXRlZ3kgPSBpbmplY3RvclN0cmF0ZWd5IGluc3RhbmNlb2YgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpO1xuICAgICAgdGhpcy5fc3RyYXRlZ3kuaW5pdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5ID0gbnVsbDtcbiAgICAgIHRoaXMuX2luamVjdG9yID0gcGFyZW50SW5qZWN0b3I7XG4gICAgICB0aGlzLl9zdHJhdGVneSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoQ29tcG9uZW50Vmlldyhjb21wb25lbnRWaWV3OiBBcHBWaWV3KSB7IHRoaXMuY29tcG9uZW50VmlldyA9IGNvbXBvbmVudFZpZXc7IH1cblxuICBwcml2YXRlIF9kZWJ1Z0NvbnRleHQoKTogYW55IHtcbiAgICB2YXIgYyA9IHRoaXMucGFyZW50Vmlldy5nZXREZWJ1Z0NvbnRleHQodGhpcywgbnVsbCwgbnVsbCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChjKSA/IG5ldyBfQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5pbmplY3RvcikgOiBudWxsO1xuICB9XG5cbiAgaGFzVmFyaWFibGVCaW5kaW5nKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciB2YiA9IHRoaXMucHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZiKSAmJiBTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHZiLCBuYW1lKTtcbiAgfVxuXG4gIGdldFZhcmlhYmxlQmluZGluZyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBpbmRleCA9IHRoaXMucHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nc1tuYW1lXTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGluZGV4KSA/IHRoaXMuZ2V0RGlyZWN0aXZlQXRJbmRleCg8bnVtYmVyPmluZGV4KSA6IHRoaXMuZ2V0RWxlbWVudFJlZigpO1xuICB9XG5cbiAgZ2V0KHRva2VuOiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0KHRva2VuKTsgfVxuXG4gIGhhc0RpcmVjdGl2ZSh0eXBlOiBUeXBlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5faW5qZWN0b3IuZ2V0T3B0aW9uYWwodHlwZSkpOyB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fc3RyYXRlZ3kpID8gdGhpcy5fc3RyYXRlZ3kuZ2V0Q29tcG9uZW50KCkgOiBudWxsOyB9XG5cbiAgZ2V0SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBnZXRFbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5yZWY7IH1cblxuICBnZXRWaWV3Q29udGFpbmVyUmVmKCk6IFZpZXdDb250YWluZXJSZWYgeyByZXR1cm4gbmV3IFZpZXdDb250YWluZXJSZWZfKHRoaXMpOyB9XG5cbiAgZ2V0VGVtcGxhdGVSZWYoKTogVGVtcGxhdGVSZWYge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5lbWJlZGRlZFZpZXdGYWN0b3J5KSkge1xuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZVJlZl8odGhpcy5yZWYpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldERlcGVuZGVuY3koaW5qZWN0b3I6IEluamVjdG9yLCBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgZGVwOiBEZXBlbmRlbmN5KTogYW55IHtcbiAgICBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikge1xuICAgICAgdmFyIGRpckRlcCA9IDxEaXJlY3RpdmVEZXBlbmRlbmN5PmRlcDtcblxuICAgICAgaWYgKGlzUHJlc2VudChkaXJEZXAuYXR0cmlidXRlTmFtZSkpIHJldHVybiB0aGlzLl9idWlsZEF0dHJpYnV0ZShkaXJEZXApO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5xdWVyeURlY29yYXRvcikpXG4gICAgICAgIHJldHVybiB0aGlzLl9xdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeShkaXJEZXAucXVlcnlEZWNvcmF0b3IpLmxpc3Q7XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuY2hhbmdlRGV0ZWN0b3JSZWZJZCkge1xuICAgICAgICAvLyBXZSBwcm92aWRlIHRoZSBjb21wb25lbnQncyB2aWV3IGNoYW5nZSBkZXRlY3RvciB0byBjb21wb25lbnRzIGFuZFxuICAgICAgICAvLyB0aGUgc3Vycm91bmRpbmcgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIHRvIGRpcmVjdGl2ZXMuXG4gICAgICAgIGlmICh0aGlzLnByb3RvLmZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCkge1xuICAgICAgICAgIC8vIE5vdGU6IFRoZSBjb21wb25lbnQgdmlldyBpcyBub3QgeWV0IGNyZWF0ZWQgd2hlblxuICAgICAgICAgIC8vIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCFcbiAgICAgICAgICByZXR1cm4gbmV3IF9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYodGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5lbGVtZW50UmVmSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudFJlZigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLnZpZXdDb250YWluZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWV3Q29udGFpbmVyUmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudGVtcGxhdGVSZWZJZCkge1xuICAgICAgICB2YXIgdHIgPSB0aGlzLmdldFRlbXBsYXRlUmVmKCk7XG4gICAgICAgIGlmIChpc0JsYW5rKHRyKSAmJiAhZGlyRGVwLm9wdGlvbmFsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE5vUHJvdmlkZXJFcnJvcihudWxsLCBkaXJEZXAua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHI7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkucmVuZGVyZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LnJlbmRlcmVyO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFBpcGVQcm92aWRlcikge1xuICAgICAgaWYgKGRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIC8vIFdlIHByb3ZpZGUgdGhlIGNvbXBvbmVudCdzIHZpZXcgY2hhbmdlIGRldGVjdG9yIHRvIGNvbXBvbmVudHMgYW5kXG4gICAgICAgIC8vIHRoZSBzdXJyb3VuZGluZyBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgdG8gZGlyZWN0aXZlcy5cbiAgICAgICAgaWYgKHRoaXMucHJvdG8uZmlyc3RQcm92aWRlcklzQ29tcG9uZW50KSB7XG4gICAgICAgICAgLy8gTm90ZTogVGhlIGNvbXBvbmVudCB2aWV3IGlzIG5vdCB5ZXQgY3JlYXRlZCB3aGVuXG4gICAgICAgICAgLy8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIVxuICAgICAgICAgIHJldHVybiBuZXcgX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZih0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQXR0cmlidXRlKGRlcDogRGlyZWN0aXZlRGVwZW5kZW5jeSk6IHN0cmluZyB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLnByb3RvLmF0dHJpYnV0ZXM7XG4gICAgaWYgKGlzUHJlc2VudChhdHRyaWJ1dGVzKSAmJiBTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKGF0dHJpYnV0ZXMsIGRlcC5hdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXNbZGVwLmF0dHJpYnV0ZU5hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdGVtcGxhdGVSZWYgPSB0aGlzLmdldFRlbXBsYXRlUmVmKCk7XG4gICAgaWYgKHF1ZXJ5LnNlbGVjdG9yID09PSBUZW1wbGF0ZVJlZiAmJiBpc1ByZXNlbnQodGVtcGxhdGVSZWYpKSB7XG4gICAgICBsaXN0LnB1c2godGVtcGxhdGVSZWYpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc3RyYXRlZ3kgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnksIGxpc3QpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUXVlcnlTdHJhdGVneSgpOiBfUXVlcnlTdHJhdGVneSB7XG4gICAgaWYgKHRoaXMucHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gX2VtcHR5UXVlcnlTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoIDw9XG4gICAgICAgICAgICAgICBJbmxpbmVRdWVyeVN0cmF0ZWd5Lk5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUykge1xuICAgICAgcmV0dXJuIG5ldyBJbmxpbmVRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IER5bmFtaWNRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH1cbiAgfVxuXG5cbiAgZ2V0RGlyZWN0aXZlQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldEF0KGluZGV4KTsgfVxuXG4gIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3F1ZXJ5U3RyYXRlZ3kpKSB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9xdWVyeVN0cmF0ZWd5KSkgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcygpO1xuICB9XG5cbiAgdHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qOiBBcHBFbGVtZW50ID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGluaikpIHtcbiAgICAgIGluai5fc2V0UXVlcmllc0FzRGlydHkoKTtcbiAgICAgIGlmIChpc0JsYW5rKGluai5wYXJlbnQpICYmIGlzUHJlc2VudChpbmoucGFyZW50Vmlldy5jb250YWluZXJBcHBFbGVtZW50KSkge1xuICAgICAgICBpbmogPSBpbmoucGFyZW50Vmlldy5jb250YWluZXJBcHBFbGVtZW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5qID0gaW5qLnBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3F1ZXJ5U3RyYXRlZ3kpKSB7XG4gICAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wYXJlbnRWaWV3LnByb3RvLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhpcy5wYXJlbnRWaWV3LmNvbnRhaW5lckFwcEVsZW1lbnQuX3F1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk7XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZDtcbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZDtcbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWY7XG59XG5cbmNsYXNzIF9FbXB0eVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk6IHZvaWQge31cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZCB7fVxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxudmFyIF9lbXB0eVF1ZXJ5U3RyYXRlZ3kgPSBuZXcgX0VtcHR5UXVlcnlTdHJhdGVneSgpO1xuXG5jbGFzcyBJbmxpbmVRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzdGF0aWMgTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTID0gMztcblxuICBxdWVyeTA6IFF1ZXJ5UmVmO1xuICBxdWVyeTE6IFF1ZXJ5UmVmO1xuICBxdWVyeTI6IFF1ZXJ5UmVmO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBBcHBFbGVtZW50KSB7XG4gICAgdmFyIHByb3RvUmVmcyA9IGVpLnByb3RvLnByb3RvUXVlcnlSZWZzO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMCkgdGhpcy5xdWVyeTAgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzBdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAxKSB0aGlzLnF1ZXJ5MSA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMV0sIGVpKTtcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDIpIHRoaXMucXVlcnkyID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1syXSwgZWkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmICF0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmICF0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTEuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmICF0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MC5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgIXRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgIXRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgIXRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5Mi51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTAudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkwO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkxO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkyO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcXVlcnkgZm9yIGRpcmVjdGl2ZSAke3F1ZXJ5fS5gKTtcbiAgfVxufVxuXG5jbGFzcyBEeW5hbWljUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgcXVlcmllczogUXVlcnlSZWZbXTtcblxuICBjb25zdHJ1Y3RvcihlaTogQXBwRWxlbWVudCkge1xuICAgIHRoaXMucXVlcmllcyA9IGVpLnByb3RvLnByb3RvUXVlcnlSZWZzLm1hcChwID0+IG5ldyBRdWVyeVJlZihwLCBlaSkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmICghcS5pc1ZpZXdRdWVyeSkgcS5kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoIXEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5pc1ZpZXdRdWVyeSkge1xuICAgICAgICBxLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBnZXRDb21wb25lbnQoKTogYW55O1xuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW47XG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHE6IFF1ZXJ5TWV0YWRhdGEsIHJlczogYW55W10pOiB2b2lkO1xuICBpbml0KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIHByb3ZpZGVycyBpcyAxMCBvciBsZXNzLlxuICogSW4gc3VjaCBhIGNhc2UsIGlubGluaW5nIGZpZWxkcyBpcyBiZW5lZmljaWFsIGZvciBwZXJmb3JtYW5jZXMuXG4gKi9cbmNsYXNzIEVsZW1lbnREaXJlY3RpdmVJbmxpbmVTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JJbmxpbmVTdHJhdGVneSwgcHVibGljIF9laTogQXBwRWxlbWVudCkge31cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuICAgIGkucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDApICYmIGkub2JqMCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDEpICYmIGkub2JqMSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDIpICYmIGkub2JqMiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDMpICYmIGkub2JqMyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDQpICYmIGkub2JqNCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDUpICYmIGkub2JqNSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDYpICYmIGkub2JqNiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDcpICYmIGkub2JqNyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDgpICYmIGkub2JqOCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDkpICYmIGkub2JqOSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9iajA7IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9laS5wcm90by5maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiZcbiAgICAgICAgICAga2V5LmlkID09PSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneS5rZXlJZDA7XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIwKSAmJiBwLnByb3ZpZGVyMC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmowID09PSBVTkRFRklORUQpIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmowKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMSkgJiYgcC5wcm92aWRlcjEua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMSA9PT0gVU5ERUZJTkVEKSBpLm9iajEgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjIpICYmIHAucHJvdmlkZXIyLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajIgPT09IFVOREVGSU5FRCkgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajIpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIzKSAmJiBwLnByb3ZpZGVyMy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmozID09PSBVTkRFRklORUQpIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICBsaXN0LnB1c2goaS5vYmozKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNCkgJiYgcC5wcm92aWRlcjQua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNCA9PT0gVU5ERUZJTkVEKSBpLm9iajQgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjUpICYmIHAucHJvdmlkZXI1LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajUgPT09IFVOREVGSU5FRCkgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajUpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI2KSAmJiBwLnByb3ZpZGVyNi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo2ID09PSBVTkRFRklORUQpIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICBsaXN0LnB1c2goaS5vYmo2KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNykgJiYgcC5wcm92aWRlcjcua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNyA9PT0gVU5ERUZJTkVEKSBpLm9iajcgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjgpICYmIHAucHJvdmlkZXI4LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajggPT09IFVOREVGSU5FRCkgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI5KSAmJiBwLnByb3ZpZGVyOS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo5ID09PSBVTkRFRklORUQpIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIGJ5IHRoZSBgRWxlbWVudEluamVjdG9yYCB3aGVuIHRoZSBudW1iZXIgb2YgYmluZGluZ3MgaXMgMTEgb3IgbW9yZS5cbiAqIEluIHN1Y2ggYSBjYXNlLCB0aGVyZSBhcmUgdG9vIG1hbnkgZmllbGRzIHRvIGlubGluZSAoc2VlIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KS5cbiAqL1xuY2xhc3MgRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEFwcEVsZW1lbnQpIHt9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaW5qLnByb3RvU3RyYXRlZ3k7XG4gICAgaW5qLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWRzW2ldKSAmJlxuICAgICAgICAgIGluai5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgaW5qLm9ianNbaV0gPSBpbmouaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9ianNbMF07IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHZhciBwID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3k7XG4gICAgcmV0dXJuIHRoaXMuX2VpLnByb3RvLmZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBpc1ByZXNlbnQoa2V5KSAmJiBrZXkuaWQgPT09IHAua2V5SWRzWzBdO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGlzdC5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICBpc3Qub2Jqc1tpXSA9IGlzdC5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5wdXNoKGlzdC5vYmpzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvUXVlcnlSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlySW5kZXg6IG51bWJlciwgcHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBxdWVyeTogUXVlcnlNZXRhZGF0YSkge31cblxuICBnZXQgdXNlc1Byb3BlcnR5U3ludGF4KCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuc2V0dGVyKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlSZWYge1xuICBwdWJsaWMgbGlzdDogUXVlcnlMaXN0PGFueT47XG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9RdWVyeVJlZjogUHJvdG9RdWVyeVJlZiwgcHJpdmF0ZSBvcmlnaW5hdG9yOiBBcHBFbGVtZW50KSB7XG4gICAgdGhpcy5saXN0ID0gbmV3IFF1ZXJ5TGlzdDxhbnk+KCk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIH1cblxuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnk7IH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRpcnR5KSByZXR1cm47XG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgLy8gVE9ETyBkZWxldGUgdGhlIGNoZWNrIG9uY2Ugb25seSBmaWVsZCBxdWVyaWVzIGFyZSBzdXBwb3J0ZWRcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCkge1xuICAgICAgdmFyIGRpciA9IHRoaXMub3JpZ2luYXRvci5nZXREaXJlY3RpdmVBdEluZGV4KHRoaXMucHJvdG9RdWVyeVJlZi5kaXJJbmRleCk7XG4gICAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmZpcnN0KSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QubGVuZ3RoID4gMCA/IHRoaXMubGlzdC5maXJzdCA6IG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmLnNldHRlcihkaXIsIHRoaXMubGlzdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5saXN0Lm5vdGlmeU9uQ2hhbmdlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlKCk6IHZvaWQge1xuICAgIHZhciBhZ2dyZWdhdG9yID0gW107XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZpZXdRdWVyeSkge1xuICAgICAgLy8gaW50ZW50aW9uYWxseSBza2lwcGluZyBvcmlnaW5hdG9yIGZvciB2aWV3IHF1ZXJpZXMuXG4gICAgICB2YXIgbmVzdGVkVmlldyA9IHRoaXMub3JpZ2luYXRvci5jb21wb25lbnRWaWV3O1xuICAgICAgaWYgKGlzUHJlc2VudChuZXN0ZWRWaWV3KSkgdGhpcy5fdmlzaXRWaWV3KG5lc3RlZFZpZXcsIGFnZ3JlZ2F0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92aXNpdCh0aGlzLm9yaWdpbmF0b3IsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgICB0aGlzLmxpc3QucmVzZXQoYWdncmVnYXRvcik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfdmlzaXQoaW5qOiBBcHBFbGVtZW50LCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2aWV3ID0gaW5qLnBhcmVudFZpZXc7XG4gICAgdmFyIHN0YXJ0SWR4ID0gaW5qLnByb3RvLmluZGV4O1xuICAgIGZvciAodmFyIGkgPSBzdGFydElkeDsgaSA8IHZpZXcuYXBwRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJJbmogPSB2aWV3LmFwcEVsZW1lbnRzW2ldO1xuICAgICAgLy8gVGhlIGZpcnN0IGluamVjdG9yIGFmdGVyIGluaiwgdGhhdCBpcyBvdXRzaWRlIHRoZSBzdWJ0cmVlIHJvb3RlZCBhdFxuICAgICAgLy8gaW5qIGhhcyB0byBoYXZlIGEgbnVsbCBwYXJlbnQgb3IgYSBwYXJlbnQgdGhhdCBpcyBhbiBhbmNlc3RvciBvZiBpbmouXG4gICAgICBpZiAoaSA+IHN0YXJ0SWR4ICYmIChpc0JsYW5rKGN1ckluai5wYXJlbnQpIHx8IGN1ckluai5wYXJlbnQucHJvdG8uaW5kZXggPCBzdGFydElkeCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmRlc2NlbmRhbnRzICYmXG4gICAgICAgICAgIShjdXJJbmoucGFyZW50ID09IHRoaXMub3JpZ2luYXRvciB8fCBjdXJJbmogPT0gdGhpcy5vcmlnaW5hdG9yKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIC8vIFdlIHZpc2l0IHRoZSB2aWV3IGNvbnRhaW5lcihWQykgdmlld3MgcmlnaHQgYWZ0ZXIgdGhlIGluamVjdG9yIHRoYXQgY29udGFpbnNcbiAgICAgIC8vIHRoZSBWQy4gVGhlb3JldGljYWxseSwgdGhhdCBtaWdodCBub3QgYmUgdGhlIHJpZ2h0IG9yZGVyIGlmIHRoZXJlIGFyZVxuICAgICAgLy8gY2hpbGQgaW5qZWN0b3JzIG9mIHNhaWQgaW5qZWN0b3IuIE5vdCBjbGVhciB3aGV0aGVyIGlmIHN1Y2ggY2FzZSBjYW5cbiAgICAgIC8vIGV2ZW4gYmUgY29uc3RydWN0ZWQgd2l0aCB0aGUgY3VycmVudCBhcGlzLlxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihjdXJJbmosIGFnZ3JlZ2F0b3IpO1xuICAgICAgdGhpcy5fdmlzaXRWaWV3Q29udGFpbmVyVmlld3MoY3VySW5qLm5lc3RlZFZpZXdzLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdEluamVjdG9yKGluajogQXBwRWxlbWVudCwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICB0aGlzLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qLCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWdncmVnYXRlRGlyZWN0aXZlKGluaiwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3Q29udGFpbmVyVmlld3Modmlld3M6IEFwcFZpZXdbXSwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KHZpZXdzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2aWV3cy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl92aXNpdFZpZXcodmlld3Nbal0sIGFnZ3JlZ2F0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlldyh2aWV3OiBBcHBWaWV3LCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5hcHBFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGluaiA9IHZpZXcuYXBwRWxlbWVudHNbaV07XG4gICAgICB0aGlzLl92aXNpdEluamVjdG9yKGluaiwgYWdncmVnYXRvcik7XG4gICAgICB0aGlzLl92aXNpdFZpZXdDb250YWluZXJWaWV3cyhpbmoubmVzdGVkVmlld3MsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyhpbmo6IEFwcEVsZW1lbnQsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHZiID0gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LnZhckJpbmRpbmdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmIubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpbmouaGFzVmFyaWFibGVCaW5kaW5nKHZiW2ldKSkge1xuICAgICAgICBhZ2dyZWdhdG9yLnB1c2goaW5qLmdldFZhcmlhYmxlQmluZGluZyh2YltpXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmo6IEFwcEVsZW1lbnQsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgaW5qLmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeSwgYWdncmVnYXRvcik7XG4gIH1cbn1cblxuY2xhc3MgX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZiBleHRlbmRzIENoYW5nZURldGVjdG9yUmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYXBwRWxlbWVudDogQXBwRWxlbWVudCkgeyBzdXBlcigpOyB9XG5cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLm1hcmtGb3JDaGVjaygpOyB9XG4gIGRldGFjaCgpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5kZXRhY2goKTsgfVxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLmRldGVjdENoYW5nZXMoKTsgfVxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5jaGVja05vQ2hhbmdlcygpOyB9XG4gIHJlYXR0YWNoKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLnJlYXR0YWNoKCk7IH1cbn1cbiJdfQ==