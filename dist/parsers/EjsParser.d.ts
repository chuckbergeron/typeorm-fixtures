import { IFixture, IParser } from '../interface';
export declare class EjsParser implements IParser {
    /**
     * @type {number}
     */
    priority: number;
    /**
     * @type {RegExp}
     */
    private readonly regExp;
    /**
     * @param {string} value
     * @return {boolean}
     */
    isSupport(value: string): boolean;
    /**
     * @param {string} value
     * @param {IFixture} fixture
     * @return {any}
     */
    parse(value: string, fixture: IFixture): any;
}
