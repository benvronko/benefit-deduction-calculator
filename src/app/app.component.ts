import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { BenefitCostCalculator } from './models/benefit-cost-calculator.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public insuredNamesForm: FormGroup;
    public deductionsForm: FormGroup;

    private readonly discount: number = .1;
    private readonly discountedFirstInitial: string = "a";
    private readonly paychecksPerYear: number = 26;
    private readonly employeeCostPerYear: number = 1000;
    private readonly dependentCostPerYear: number = 500;

    private benefitCostCalculator: BenefitCostCalculator;

    constructor(private formBuilder: FormBuilder,
        private currencyPipe: CurrencyPipe) {

        this.benefitCostCalculator = new BenefitCostCalculator(this.employeeCostPerYear, this.dependentCostPerYear, this.discount, this.discountedFirstInitial)
    }

    ngOnInit() {
        this.insuredNamesForm = this.formBuilder.group({
            employeeName: ["", [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
            spouseName: [""],
            childNames: this.formBuilder.array([]),
        });

        this.deductionsForm = this.formBuilder.group({
            perCheck: [{ value: "$0.00", disabled: true }],
            monthly: [{ value: "$0.00", disabled: true }],
            yearly: [{ value: "$0.00", disabled: true }],
        });

        this.onChanges();
    }

    public clearNamesForm() {
        this.insuredNamesForm.get("employeeName").patchValue("");
        this.insuredNamesForm.get("spouseName").patchValue("");
        let childNamesFormArray = this.insuredNamesForm.get("childNames") as FormArray;
        while (childNamesFormArray.length !== 0) {
            childNamesFormArray.removeAt(0)
        }
    }

    public trackByFn(index: any, item: any): void {
        return index;
    }

    public addChildControl(): void {
        let childNamesFormArray = this.insuredNamesForm.get("childNames") as FormArray;
        childNamesFormArray.push(this.formBuilder.control(""));
    }

    private onChanges(): void {
        this.insuredNamesForm.valueChanges.subscribe(val => {
            if (val.employeeName === undefined || val.employeeName === null || val.employeeName === "") {
                this.displayDeductions(0);
                this.insuredNamesForm.get("employeeName").markAsTouched();
                return;
            }

            this.updateDeductions();
        });
    }

    private updateDeductions(): void {
        const formData = this.insuredNamesForm.value;

        let childNamesFormArray = this.insuredNamesForm.get("childNames") as FormArray;

        let childNames: string[] = [];
        for (let childNameControl of childNamesFormArray.controls) {
            childNames.push(childNameControl.value);
        }

        let yearlyCost = this.benefitCostCalculator.calculateYearlyCost(formData.employeeName, formData.spouseName, childNames)
        this.displayDeductions(yearlyCost);
    }

    private displayDeductions(yearlyCost: number): void {
        this.deductionsForm.get("perCheck").patchValue(this.formatToUsd(yearlyCost / this.paychecksPerYear))
        this.deductionsForm.get("monthly").patchValue(this.formatToUsd(yearlyCost / 12))
        this.deductionsForm.get("yearly").patchValue(this.formatToUsd(yearlyCost))
    }

    private formatToUsd(value: number): string {
        return this.currencyPipe.transform(value, 'USD', 'symbol-narrow', '1.2-2');
    }
}
