import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int h = sc.nextInt();
        if (h <= 40) System.out.print(h * 120);
        else System.out.print(40 * 120 + (h - 40) * 150);
    }
}
