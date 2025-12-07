import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        switch (s){
            case "red":
                System.out.print("Red Color");
                break;
            case "blue":
                System.out.print("Blue Color");
                break;
            default:
                System.out.print("Unknown");
        }
    }
}
