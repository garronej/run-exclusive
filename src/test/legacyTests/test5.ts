import * as runExclusive from "../../lib/runExclusive";

class MyClass {

    constructor() { };

    public alphabet = "";

    public static readonly groupRef = runExclusive.createGroupRef();

    public myMethod = runExclusive.buildMethodCb(MyClass.groupRef,
        (char: string, wait: number, callback?: (alphabet: string)=> void): void => {

            setTimeout(() => {
                this.alphabet += char;
                callback!(this.alphabet);
            }, wait);

        }
    );


}


let start = Date.now();

let inst1 = new MyClass();

inst1.myMethod.call(MyClass, "a", 1000, alphabet => console.log(alphabet));
inst1.myMethod.call(MyClass, "b", 1000, alphabet => console.log(alphabet));

let inst2 = new MyClass();

let rev = ["n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b"];
let wait = 500;

for (let char of rev)
    inst2.myMethod.call(MyClass, char, wait, alphabet => console.log(alphabet));

inst2.myMethod.call(MyClass, "a", wait, function () {

    //cSpell: disable
    console.assert(inst2.alphabet === "nmlkjihgfedcba");
    //cSpell: enable

});

inst1.myMethod.call(MyClass, "c", 1000, alphabet => console.log(alphabet));
inst1.myMethod.call(MyClass, "d", 1000, () => {

    let duration = Date.now() - start;

    //cSpell: disable
    console.assert(inst1.alphabet === "abcd");
    //cSpell: enable

    let expectedDuration = 1000 * 4 + (rev.length + 1) * wait;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert(Math.abs(duration - expectedDuration) < 300);
    console.assert(duration - expectedDuration >= 0);

    console.log("PASS");

});
