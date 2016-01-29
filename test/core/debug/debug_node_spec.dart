library angular2.test.core.debug.debug_node_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        xdescribe,
        describe,
        dispatchEvent,
        expect,
        iit,
        inject,
        beforeEachProviders,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/async.dart"
    show PromiseWrapper, EventEmitter, ObservableWrapper;
import "package:angular2/core.dart" show Injectable;
import "package:angular2/common.dart" show NgFor, NgIf;
import "package:angular2/platform/common_dom.dart" show By;
import "package:angular2/src/core/metadata.dart"
    show Directive, Component, View, Input;

@Injectable()
class Logger {
  List<String> log;
  Logger() {
    this.log = [];
  }
  add(String thing) {
    this.log.add(thing);
  }
}

@Directive(selector: "[message]", inputs: const ["message"])
@Injectable()
class MessageDir {
  Logger logger;
  MessageDir(Logger logger) {
    this.logger = logger;
  }
  set message(newMessage) {
    this.logger.add(newMessage);
  }
}

@Component(selector: "child-comp")
@View(
    template: '''<div class="child" message="child">
               <span class="childnested" message="nestedchild">Child</span>
             </div>
             <span class="child" [innerHtml]="childBinding"></span>''',
    directives: const [MessageDir])
@Injectable()
class ChildComp {
  String childBinding;
  ChildComp() {
    this.childBinding = "Original";
  }
}

@Component(selector: "parent-comp", viewProviders: const [Logger])
@View(
    template: '''<div class="parent" message="parent">
               <span class="parentnested" message="nestedparent">Parent</span>
             </div>
             <span class="parent" [innerHtml]="parentBinding"></span>
             <child-comp class="child-comp-class"></child-comp>''',
    directives: const [ChildComp, MessageDir])
@Injectable()
class ParentComp {
  String parentBinding;
  ParentComp() {
    this.parentBinding = "OriginalParent";
  }
}

@Directive(selector: "custom-emitter", outputs: const ["myevent"])
@Injectable()
class CustomEmitter {
  EventEmitter<dynamic> myevent;
  CustomEmitter() {
    this.myevent = new EventEmitter();
  }
}

@Component(selector: "events-comp")
@View(
    template: '''<button (click)="handleClick()"></button>
             <custom-emitter (myevent)="handleCustom()"></custom-emitter>''',
    directives: const [CustomEmitter])
@Injectable()
class EventsComp {
  bool clicked;
  bool customed;
  EventsComp() {
    this.clicked = false;
    this.customed = false;
  }
  handleClick() {
    this.clicked = true;
  }

  handleCustom() {
    this.customed = true;
  }
}

@Component(selector: "cond-content-comp", viewProviders: const [Logger])
@View(
    template:
        '''<div class="child" message="child" *ngIf="myBool"><ng-content></ng-content></div>''',
    directives: const [NgIf, MessageDir])
@Injectable()
class ConditionalContentComp {
  bool myBool = false;
}

@Component(selector: "conditional-parent-comp", viewProviders: const [Logger])
@View(
    template: '''<span class="parent" [innerHtml]="parentBinding"></span>
            <cond-content-comp class="cond-content-comp-class">
              <span class="from-parent"></span>
            </cond-content-comp>''',
    directives: const [ConditionalContentComp])
@Injectable()
class ConditionalParentComp {
  String parentBinding;
  ConditionalParentComp() {
    this.parentBinding = "OriginalParent";
  }
}

@Component(selector: "using-for", viewProviders: const [Logger])
@View(
    template: '''<span *ngFor="#thing of stuff" [innerHtml]="thing"></span>
            <ul message="list">
              <li *ngFor="#item of stuff" [innerHtml]="item"></li>
            </ul>''',
    directives: const [NgFor, MessageDir])
@Injectable()
class UsingFor {
  List<String> stuff;
  UsingFor() {
    this.stuff = ["one", "two", "three"];
  }
}

@Directive(selector: "[mydir]", exportAs: "mydir")
class MyDir {}

@Component(
    selector: "locals-comp",
    template: '''
   <div mydir #alice="mydir"></div>
 ''',
    directives: const [MyDir])
class LocalsComp {}

@Component(
    selector: "bank-account",
    template: '''
   Bank Name: {{bank}}
   Account Id: {{id}}
 ''')
class BankAccount {
  @Input() String bank;
  @Input("account") String id;
  String normalizedBankName;
}

@Component(
    selector: "test-app",
    template: '''
   <bank-account bank="RBC" account="4747"></bank-account>
 ''',
    directives: const [BankAccount])
class TestApp {}

main() {
  describe("debug element", () {
    it(
        "should list all child nodes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            // The root component has 3 elements and 2 text node children.
            expect(fixture.debugElement.childNodes.length).toEqual(5);
            async.done();
          });
        }));
    it(
        "should list all component child elements",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            var childEls = fixture.debugElement.children;
            // The root component has 3 elements in its view.
            expect(childEls.length).toEqual(3);
            expect(DOM.hasClass(childEls[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(childEls[1].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(childEls[2].nativeElement, "child-comp-class"))
                .toBe(true);
            var nested = childEls[0].children;
            expect(nested.length).toEqual(1);
            expect(DOM.hasClass(nested[0].nativeElement, "parentnested"))
                .toBe(true);
            var childComponent = childEls[2];
            var childCompChildren = childComponent.children;
            expect(childCompChildren.length).toEqual(2);
            expect(DOM.hasClass(childCompChildren[0].nativeElement, "child"))
                .toBe(true);
            expect(DOM.hasClass(childCompChildren[1].nativeElement, "child"))
                .toBe(true);
            var childNested = childCompChildren[0].children;
            expect(childNested.length).toEqual(1);
            expect(DOM.hasClass(childNested[0].nativeElement, "childnested"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should list conditional component child elements",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ConditionalParentComp).then((fixture) {
            fixture.detectChanges();
            var childEls = fixture.debugElement.children;
            // The root component has 2 elements in its view.
            expect(childEls.length).toEqual(2);
            expect(DOM.hasClass(childEls[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(
                    childEls[1].nativeElement, "cond-content-comp-class"))
                .toBe(true);
            var conditionalContentComp = childEls[1];
            expect(conditionalContentComp.children.length).toEqual(0);
            conditionalContentComp.componentInstance.myBool = true;
            fixture.detectChanges();
            expect(conditionalContentComp.children.length).toEqual(1);
            async.done();
          });
        }));
    it(
        "should list child elements within viewports",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(UsingFor).then((fixture) {
            fixture.detectChanges();
            var childEls = fixture.debugElement.children;
            expect(childEls.length).toEqual(4);
            // The 4th child is the <ul>
            var list = childEls[3];
            expect(list.children.length).toEqual(3);
            async.done();
          });
        }));
    it(
        "should list element attributes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(TestApp).then((fixture) {
            fixture.detectChanges();
            var bankElem = fixture.debugElement.children[0];
            expect(bankElem.attributes["bank"]).toEqual("RBC");
            expect(bankElem.attributes["account"]).toEqual("4747");
            async.done();
          });
        }));
    it(
        "should query child elements by css",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            var childTestEls =
                fixture.debugElement.queryAll(By.css("child-comp"));
            expect(childTestEls.length).toBe(1);
            expect(DOM.hasClass(
                    childTestEls[0].nativeElement, "child-comp-class"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should query child elements by directive",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            var childTestEls =
                fixture.debugElement.queryAll(By.directive(MessageDir));
            expect(childTestEls.length).toBe(4);
            expect(DOM.hasClass(childTestEls[0].nativeElement, "parent"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[1].nativeElement, "parentnested"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[2].nativeElement, "child"))
                .toBe(true);
            expect(DOM.hasClass(childTestEls[3].nativeElement, "childnested"))
                .toBe(true);
            async.done();
          });
        }));
    it(
        "should list providerTokens",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.providerTokens).toContain(Logger);
            async.done();
          });
        }));
    it(
        "should list locals",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(LocalsComp).then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.children[0].getLocal("alice"))
                .toBeAnInstanceOf(MyDir);
            async.done();
          });
        }));
    it(
        "should allow injecting from the element injector",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(ParentComp).then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.children[0].inject(Logger).log)
                .toEqual(["parent", "nestedparent", "child", "nestedchild"]);
            async.done();
          });
        }));
    it(
        "should list event listeners",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(EventsComp).then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.children[0].listeners.length)
                .toEqual(1);
            expect(fixture.debugElement.children[1].listeners.length)
                .toEqual(1);
            async.done();
          });
        }));
    it(
        "should trigger event handlers",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          tcb.createAsync(EventsComp).then((fixture) {
            fixture.detectChanges();
            expect(fixture.debugElement.componentInstance.clicked).toBe(false);
            expect(fixture.debugElement.componentInstance.customed).toBe(false);
            fixture.debugElement.children[0]
                .triggerEventHandler("click", ({} as dynamic));
            expect(fixture.debugElement.componentInstance.clicked).toBe(true);
            fixture.debugElement.children[1]
                .triggerEventHandler("myevent", ({} as dynamic));
            expect(fixture.debugElement.componentInstance.customed).toBe(true);
            async.done();
          });
        }));
  });
}
