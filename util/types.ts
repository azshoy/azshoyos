

export class Vector2{
    x:number
    y:number
    constructor(x?:number, y?:number) {
        this.x = (x === undefined) ? 0 : x
        this.y = (y === undefined) ? this.x : y
    }
    add(v:Vector2){
        this.x += v.x
        this.y += v.y
    }
    differenceOf(v:Vector2){
        return new Vector2(this.x - v.x, this.y - v.y)
    }
    multiply(m:number){
        this.x *= m
        this.y *= m
    }
    productOf(m:number){
        return new Vector2(this.x * m, this.y * m)
    }
    divide(d:number){
        if (d){
            this.x /= d
            this.y /= d
        } else {
          console.log("Division by zero!")
        }
    }
    factorOf(d:number){
        if (d) return new Vector2(this.x / d, this.y / d)
        console.log("Division by zero!")
        return new Vector2()
    }
    distanceTo(v:Vector2){
        return this.differenceOf(v).length
    }
    distanceToSquared(v:Vector2){
        return this.differenceOf(v).lengthSquared
    }
    withFunc(f:CallableFunction){
        return new Vector2(f(this.x), f(this.y))
    }
    get absolute(){
        return this.withFunc(Math.abs)
    }
    get length(){
        return Math.sqrt(this.lengthSquared)
    }
    get lengthSquared(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2)
    }
    get normalized(){
        return this.factorOf(this.length)
    }
    normalize(){
        this.divide(this.length)
    }
    get clone(){
        return new Vector2(this.x, this.y)
    }
}