import * as runExclusive from "../lib/runExclusive";

class MyClass {

    constructor() { };

    public alphabet = "";

    public myMethod = runExclusive.buildMethod(
        async (char: string): Promise<string> => {

            await new Promise<void>(resolve => setTimeout(()=>resolve(), 1000));

            this.alphabet += char;

            return this.alphabet;

        }
    );


}

class MyClassProxy {

    constructor() { };

    private myClassInst = new MyClass();

    public callCount = 0;

    public getAlphabet(): typeof MyClass.prototype.alphabet {
        return this.myClassInst.alphabet;
    }

    public myMethod: typeof MyClass.prototype.myMethod =
    runExclusive.buildMethod(
        (...inputs)=>{

            this.callCount++;

            return this.myClassInst.myMethod.apply(this.myClassInst, inputs);

        }
    );


}

let inst = new MyClassProxy();

setTimeout(() => {

    console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 3);

    console.assert(inst.getAlphabet() === "ab");

    runExclusive.cancelAllQueuedCalls(inst.myMethod, inst);

    setTimeout(() => {

        console.assert(inst.getAlphabet() === "abc");

        console.log("PASS");

    }, 2000);

}, 2900);

console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === false );
inst.myMethod("a");
console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 0);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true );

for (let char of ["b", "c", "d", "e", "f"])
    inst.myMethod(char).then( alphabet => console.log(`step ${alphabet}`));

console.assert(runExclusive.getQueuedCallCount(inst.myMethod, inst) === 5);
console.assert(runExclusive.isRunning(inst.myMethod, inst) === true );

console.assert(inst.callCount === 1);
