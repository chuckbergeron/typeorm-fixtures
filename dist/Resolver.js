"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class Resolver {
    constructor() {
        this.stack = [];
    }
    /**
     * @param fixtureConfigs
     * @return {IFixture[]}
     */
    resolve(fixtureConfigs) {
        for (const { entity, items, parameters, processor } of fixtureConfigs) {
            for (const [mainReferenceName, propertyList] of Object.entries(items)) {
                const rangeRegExp = /^([\w-_]+)\{(\d+)\.\.(\d+)\}$/gm;
                let referenceNames = [];
                if (rangeRegExp.test(mainReferenceName)) {
                    const result = mainReferenceName.split(rangeRegExp);
                    /* istanbul ignore else */
                    if (result) {
                        referenceNames = lodash_1.range(+result[2], +(+result[3]) + 1).map(rangeNumber => `${result[1]}${rangeNumber}`);
                    }
                }
                else {
                    referenceNames = [mainReferenceName];
                }
                for (const name of referenceNames) {
                    const data = Object.assign({}, propertyList);
                    this.stack.push({
                        parameters: parameters || {},
                        processor,
                        entity: entity,
                        name: name,
                        data,
                        dependencies: this.resolveDependencies(name, data),
                    });
                }
            }
        }
        return this.stack
            .map(s => (Object.assign({}, s, { dependencies: this.resolveDeepDependencies(s) })))
            .sort((a, b) => a.dependencies.length - b.dependencies.length);
    }
    /**
     * @param {string} parentReferenceName
     * @param {any[] | object} propertyList
     * @return {any[]}
     */
    resolveDependencies(parentReferenceName, propertyList) {
        const dependencies = [];
        for (const [key, value] of Object.entries(propertyList)) {
            if (typeof value === 'string' && value.indexOf('@') === 0) {
                const reference = this.resolveReference(parentReferenceName, value.substr(1));
                propertyList[key] = `@${reference}`;
                dependencies.push(reference);
            }
            else if (typeof value === 'object' && value !== null) {
                dependencies.push(...this.resolveDependencies(parentReferenceName, value));
            }
        }
        return dependencies;
    }
    /**
     * @param {string} fixtureIdentify
     * @param {string} reference
     * @return {any}
     */
    resolveReference(fixtureIdentify, reference) {
        const currentRegExp = /^([\w-_]+)\(\$current\)$/gm;
        const rangeRegExp = /^([\w-_]+)\{(\d+)\.\.(\d+)\}$/gm;
        if (currentRegExp.test(reference)) {
            const currentIndexRegExp = /^[a-z\_\-]+(\d+)$/gi;
            const splitting = fixtureIdentify.split(currentIndexRegExp);
            /* istanbul ignore else */
            if (!splitting[1]) {
                throw new Error(`Error parsed index in reference: "${reference}" and fixture identify: ${fixtureIdentify}`);
            }
            return reference.replace('($current)', splitting[1]);
        }
        else if (rangeRegExp.test(reference)) {
            const splitting = reference.split(rangeRegExp);
            lodash_1.sample(lodash_1.range(+splitting[2], +(+splitting[3]) + 1));
            return `${splitting[1]}${lodash_1.sample(lodash_1.range(+splitting[2], +(+splitting[3]) + 1))}`;
        }
        return reference;
    }
    /**
     * @param item
     * @return {any[]}
     */
    resolveDeepDependencies(item) {
        const dependencies = [];
        for (const dependencyName of item.dependencies) {
            const dependencyElement = this.stack.find(s => s.name === dependencyName);
            if (!dependencyElement) {
                /* istanbul ignore else */
                if (dependencyName.substr(dependencyName.length - 1) !== '*') {
                    throw new Error(`Reference "${dependencyName}" not found`);
                }
                const prefix = dependencyName.substr(0, dependencyName.length - 1);
                const regex = new RegExp(`^${prefix}([0-9]+)$`);
                for (const dependencyMaskElement of this.stack.filter(s => regex.test(s.name))) {
                    dependencies.push(dependencyMaskElement.name, ...this.resolveDeepDependencies(dependencyMaskElement));
                }
            }
            else {
                dependencies.push(dependencyName, ...this.resolveDeepDependencies(dependencyElement));
            }
        }
        return dependencies.filter((value, index, self) => self.indexOf(value) === index);
    }
}
exports.Resolver = Resolver;
//# sourceMappingURL=Resolver.js.map