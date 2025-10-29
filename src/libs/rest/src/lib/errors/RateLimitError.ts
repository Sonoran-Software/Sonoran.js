import type { RateLimitData } from '../REST';
import { productEnums } from '../../../../../constants';

export class RateLimitError extends Error implements RateLimitData {
	public product: productEnums;
	public type: string;
	public timeTill: NodeJS.Timer;
	public constructor({ product, type, timeTill }: RateLimitData) {
		super();
		this.product = product;
		this.type = type;
		this.timeTill = timeTill;
	}

	/**
	 * The name of the error
	 */
	public override get name(): string {
		let productName: string;
		switch (this.product) {
			case productEnums.CAD: {
				productName = 'Sonoran CAD';
				break;
			}
			case productEnums.CMS: {
				productName = 'Sonoran CMS';
				break;
			}
			case productEnums.RADIO: {
				productName = 'Sonoran Radio';
				break;
			}
			default: {
				productName = 'Invalid Product';
			}
		}
		return `Ratelimit Hit - [${productName} '${this.type}']`;
	}
}
