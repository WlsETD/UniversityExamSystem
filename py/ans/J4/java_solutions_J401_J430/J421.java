import java.util.*;
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        if (x > 10) System.out.print(x * 2);
        else if (x == 10) System.out.print(0);
        else System.out.print(-x);
    }
}
