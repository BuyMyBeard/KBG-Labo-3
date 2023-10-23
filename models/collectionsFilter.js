export default class CollectionFilter
{
    constructor(objects, query, model)
    {
        this.objects = objects;
        this.query = query;
        this.model = model;
    }
    get()
    {
        Object.keys(this.query).forEach((param) => 
        {
            if (this.model.fields.findIndex(field => field.name === param) !== -1)
            {
                this.objects = this.objects.filter(object => this.valueMatch(object[param], this.query[param]));
            }
        });
        if (this.query.sort !== undefined && this.model.fields.findIndex(field => field.name === this.query.sort) !== -1)
        {
            this.objects.sort((a, b) => this.innerCompare(a[this.query.sort], b[this.query.sort]))
        }

        if (this.query.sort !== undefined)
        {
            const [sortField, desc] = this.query.sort.split(",");
            if (this.model.fields.findIndex(field => field.name === sortField) !== -1)
            {
                this.objects.sort((a, b) => desc !== "desc" ? this.innerCompare(a[sortField], b[sortField]) : this.innerCompare(b[sortField], a[sortField]));
            }
        }
        if (this.query.field != undefined && this.model.fields.findIndex(field => field.name === this.query.field) !== -1)
        {
            const field = this.query.field;
            const set = new Set();
            this.objects.forEach(object => set.add(object[field]));
            const newObjects = [];
            set.forEach(entry => 
            {
                const o = {};
                o[field] = entry;
                newObjects.push(o);
            });
            this.objects = newObjects;
        }
        else if (this.query.fields !== undefined)
        {
            const displayedFields = this.query.fields.split(",");
            this.objects = this.objects.map(object => 
            {
                const newObject = {};
                displayedFields.forEach(field => newObject[field] = object[field]);
                return newObject;
            });
            const set = new Set();
            this.objects.forEach(object => set.add(JSON.stringify(object)));
            const newObjects = [];
            set.forEach(item => newObjects.push(JSON.parse(item)));
            this.objects = newObjects;
        }
        const offset = Number(this.query.offset);
        const limit = Number(this.query.limit);
        if (!isNaN(offset) && !isNaN(limit)) 
        {
            this.objects = [...this.objects].splice(offset, limit);
        }
        return this.objects;
    }
    valueMatch(value, searchValue) 
    {
        try {
        let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
        return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
        console.log(error);
        return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
        return x.localeCompare(y);
        else
        return this.compareNum(x, y);
    }
    equal(ox, oy) {
        let equal = true;
        Object.keys(ox).forEach(function (member) {
            if (ox[member] != oy[member]) {
                equal = false;
                return false;
            }
        })
        return equal;
    }
}