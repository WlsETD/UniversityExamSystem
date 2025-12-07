import java.util.*;

class Product705 {
    int price;
    int quantity;

    Product705(int price, int quantity) {
        this.price = price;
        this.quantity = quantity;
    }

    int total() {
        return price * quantity;
    }
}

public class J705 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int price = sc.nextInt();
        int quantity = sc.nextInt();
        Product705 p = new Product705(price, quantity);
        System.out.print(p.total());
    }
}
