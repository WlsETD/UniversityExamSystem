import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt(), y = sc.nextInt();
        String op = sc.next();
        switch (op){
            case "+":
                System.out.print(x + y);
                break;
            case "-":
                System.out.print(x - y);
                break;
            case "*":
                System.out.print(x * y);
                break;
            case "/":
                System.out.print(x / y);
                break;
            default:
                System.out.print("ERR");
        }
    }
}
