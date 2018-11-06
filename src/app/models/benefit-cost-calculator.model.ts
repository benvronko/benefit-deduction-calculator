export class BenefitCostCalculator {
    private readonly discount: number = .1;
    private readonly discountedFirstInitial: string = "a";
    private readonly employeeCostPerYear: number = 1000;
    private readonly dependentCostPerYear: number = 500;

    constructor(employeeCostPerYear: number,
                dependentCostPerYear: number,
                discount: number,
                discountedFirstInitial: string) {

        this.employeeCostPerYear = employeeCostPerYear;
        this.dependentCostPerYear = dependentCostPerYear;
        this.discount = discount;
        this.discountedFirstInitial = discountedFirstInitial;
    }

    public calculateYearlyCost(employeeName: string, spouseName: string, childNames: string[]): number {
        let yearlyCost: number = this.getPersonCost(employeeName, this.employeeCostPerYear);

        if (spouseName !== null && spouseName !== "") {
            yearlyCost += this.getPersonCost(spouseName, this.dependentCostPerYear);
        }

        childNames.forEach(childName => {
            if (childName !== null && childName !== "") {
                yearlyCost += this.getPersonCost(childName, this.dependentCostPerYear);
            }
        })

        return yearlyCost;
    }

    private getPersonCost(name: string, benefitCost: number): number {
        if (name === null || name === "") {
            return 0;
        }

        if (this.isDiscounted(name)) {
            return benefitCost * (1 - this.discount);
        }

        return benefitCost
    }

    private isDiscounted(name: string): boolean {
        return (name.toLowerCase().charAt(0) === this.discountedFirstInitial);
    }
}