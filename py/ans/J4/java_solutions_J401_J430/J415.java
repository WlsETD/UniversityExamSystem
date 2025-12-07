import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        switch (s){
            case "add":
                System.out.print("Add Item");
                break;
            case "del":
                System.out.print("Delete Item");
                break;
            case "exit":
                System.out.print("Exit Program");
                break;
            default:
                System.out.print("Unknown");
        }
    }
}
