import fixtures from '../__fixtures__';

const { setup, skipTest, initTrezorConnect, Controller, TrezorConnect } = global.Trezor;

let controller;
let currentMnemonic;

// let _popup;

// window.addEventListener('message', message => {
//     const { data } = message;
//     console.log('GET MESSAGES', message);
//     if (data && data.type === 'popup-bootstrap') {
//         // console.log("GET MESSAGES", message.source);
//         // _popup.addEventListener('message', (m) => {
//         //     console.log("m1")
//         // })
//         // _popup
//         try {
//             console.log('POP2', _popup.postMessage);
//             console.log('POP3', _popup.location);
//             console.log('POP4', _popup.addEventListener);
//             // console.log("SRC", _popup);
//         } catch (error) {
//             console.log('error', error);
//         }
//     }
// });

// window.open = function (open) {
//     return function (url, name, features) {
//         console.log("WINDOW OPEN", url, name, features)
//         // set name if missing here
//         // name = name || "default_window_name";
//         // _popup = open.call(window, url, name, features)
//         // _popup.fixtures = "FIXBAR";

//         const instance = document.createElement('iframe');
//         instance.onload = () => {
//             console.log("ONLOAD", instance.location)
//             instance.contentWindow.opener = window;
//         }

//         instance.setAttribute('src', url);
//         instance.close = () => {
//             document.body.removeChild(instance);
//         }
//         document.body.appendChild(instance);

//         return instance;

//         // _popup.addEventListener('message', () => {
//         //     console.log("m1")
//         // })
//         // _popup.window.addEventListener('message', () => {
//         //     console.log("m1")
//         // })
//         // console.log("CATCH HIS MESS", _popup, _popup.document.body)
//         return _popup;
//     };
// }(window.open);
// window.TrezorConnect = TrezorConnect;

// const { setup, teardown, controller } = global.JestMocks;
// const { KarmaSetup } = global;

fixtures.forEach(testCase => {
    describe(`TrezorConnect.${testCase.method}`, () => {
        beforeAll(async done => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
            // jasmine is missing toMatchObject (like jest)
            jasmine.addMatchers({
                toMatchObject: _obj => ({
                    compare: (actual, expected) => {
                        const success = { pass: true, message: 'passed' };
                        if (actual === expected) return success;
                        if (expected === null || typeof expected !== 'object') {
                            return {
                                pass: false,
                                message: 'toMatchObject: "expected" is not a object',
                            };
                        }
                        const nested = Object.keys(expected).reduce((match, key) => {
                            if (typeof expected[key] === 'object') {
                                match[key] = jasmine.objectContaining(expected[key]);
                            } else {
                                match[key] = expected[key];
                            }
                            return match;
                        }, {});
                        expect(actual).toEqual(jasmine.objectContaining(nested));
                        return success;
                    },
                }),
            });

            try {
                if (!controller) {
                    controller = new Controller({
                        url: 'ws://localhost:9001/',
                        name: testCase.method,
                    });
                    controller.on('error', error => {
                        controller = undefined;
                        console.log('Controller WS error', error);
                    });
                    controller.on('disconnect', () => {
                        controller = undefined;
                        console.log('Controller WS disconnected');
                    });
                }

                if (testCase.setup.mnemonic !== currentMnemonic) {
                    await setup(controller, testCase.setup);
                    currentMnemonic = testCase.setup.mnemonic;
                }

                await initTrezorConnect(controller, {
                    popup: false,
                    connectSrc: 'http://localhost:8099/base/build/',
                });

                done();
            } catch (error) {
                console.log('Controller WS init error', error);
                done(error);
            }
        }, 30000);

        // afterAll(async done => {
        //     TrezorConnect.dispose();
        //     if (controller) {
        //         // await controller.send({ type: 'bridge-stop', version: '2' });
        //         // await controller.send({ type: 'emulator-stop', version: '2' });
        //         await controller.disconnect();
        //         controller = undefined;
        //     }
        //     done();
        // });

        afterAll(done => {
            TrezorConnect.dispose();
            done();
        });

        testCase.tests.forEach(t => {
            // check if test should be skipped on current configuration
            const testMethod = skipTest(t.skip) ? it.skip : it;
            testMethod(
                t.description,
                async done => {
                    if (!controller) {
                        done(new Error('Controller not found'));
                        return;
                    }

                    if (t.mnemonic && t.mnemonic !== currentMnemonic) {
                        // single test requires different seed, switch it
                        await setup(controller, { mnemonic: t.mnemonic });
                        currentMnemonic = t.mnemonic;
                    } else if (!t.mnemonic && testCase.setup.mnemonic !== currentMnemonic) {
                        // restore testCase.setup
                        await setup(controller, testCase.setup);
                        currentMnemonic = testCase.setup.mnemonic;
                    }

                    controller.options.name = t.description;
                    const result = await TrezorConnect[testCase.method](t.params);
                    console.warn('TC RES', testCase.method, result);
                    const expected = t.result
                        ? { success: true, payload: t.result }
                        : { success: false };
                    expect(result).toMatchObject(expected);
                    done();
                },
                t.customTimeout || 20000,
            );
        });

        // it('should test window open event', async (done) => {
        //     const result = await TrezorConnect.getPublicKey({
        //         path: "m/0",
        //     });

        //     const p = new Promise(resolve => {
        //         setTimeout(() => {
        //             console.log("RESOLVING!")
        //             // console.log("CATCH HIS MESS", _popup, _popup.document.body)
        //             resolve();
        //         }, 5000)
        //     })

        //     await p;
        //     expect(1).toBe(1);
        //     done();

        //     // const result = 'a';
        //     // console.log("RESULT", result)
        //     // expect(result).toBe('http://www.example.com');
        //     // done();
        // });
    });
});
