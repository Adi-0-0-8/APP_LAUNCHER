export namespace main {
	
	export class URLItem {
	    id: string;
	    url: string;
	    title: string;
	    favicon: string;
	    published: boolean;
	    customName: string;
	
	    static createFrom(source: any = {}) {
	        return new URLItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.title = source["title"];
	        this.favicon = source["favicon"];
	        this.published = source["published"];
	        this.customName = source["customName"];
	    }
	}

}

