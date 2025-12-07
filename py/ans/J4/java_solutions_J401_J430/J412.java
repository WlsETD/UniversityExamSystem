import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int s = sc.nextInt();
        if (s >= 90) System.out.print("A");
        else if (s >= 80) System.out.print("B");
        else System.out.print("C");
    }
}
